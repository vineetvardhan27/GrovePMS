const assert = require('assert');

console.log('================================================================');
console.log('     SEARCH & FILTER INTERACTION OPTIMIZATION AUDIT             ');
console.log('================================================================\n');

// Mock implementation of the search debouncing and cancellation controller
function createSearchController({ onExecute, debounceMs = 250 }) {
  let timer = null;
  let activeSeq = 0;
  let currentQuery = '';

  return {
    handleSearchChange: (newVal) => {
      currentQuery = newVal;

      // Cancel obsolete pending timer immediately
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      // If user cleared the input completely, execute immediately
      if (!newVal.trim()) {
        activeSeq++;
        const seq = activeSeq;
        onExecute({ query: '', page: 1, seq, immediate: true });
        return;
      }

      // Otherwise debounce by debounceMs
      timer = setTimeout(() => {
        activeSeq++;
        const seq = activeSeq;
        onExecute({ query: newVal.trim(), page: 1, seq, immediate: false });
        timer = null;
      }, debounceMs);
    },

    handleClearSearch: () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      currentQuery = '';
      activeSeq++;
      const seq = activeSeq;
      onExecute({ query: '', page: 1, seq, immediate: true });
    },

    handleKeyDownEnter: () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      activeSeq++;
      const seq = activeSeq;
      onExecute({ query: currentQuery.trim(), page: 1, seq, immediate: true });
    },

    handleImmediateFilterChange: (filterKey, filterValue) => {
      // Filters like status, mode, datePreset execute IMMEDIATELY with no debounce
      activeSeq++;
      const seq = activeSeq;
      onExecute({ [filterKey]: filterValue, page: 1, seq, immediate: true });
    },

    cleanup: () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
  };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  // --------------------------------------------------------------------------
  // TEST 1: Rapid Typing & Request Debounce Verification
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Rapid Typing & Request Debounce (250ms) ---');
  const requests = [];
  const controller = createSearchController({
    onExecute: (req) => requests.push(req),
    debounceMs: 250,
  });

  // User types "j", "jo", "joh", "john" with 50ms gaps (total 150ms < 250ms)
  controller.handleSearchChange('j');
  await sleep(50);
  controller.handleSearchChange('jo');
  await sleep(50);
  controller.handleSearchChange('joh');
  await sleep(50);
  controller.handleSearchChange('john');

  // At this point (150ms in), no request should have fired yet
  assert.strictEqual(requests.length, 0, 'No requests should fire before debounce window completes');

  // Wait 300ms for debounce timer to fire
  await sleep(300);

  // Exactly ONE request should have been dispatched for the final value "john"
  assert.strictEqual(requests.length, 1, 'Only 1 request should fire for the whole rapid typing sequence');
  assert.strictEqual(requests[0].query, 'john', 'Request query must be "john"');
  assert.strictEqual(requests[0].page, 1, 'Search change must reset page to 1');
  console.log(`[PASS] Rapid Typing (4 keystrokes): Reduced 4 potential API requests down to exactly 1 request.`);

  // --------------------------------------------------------------------------
  // TEST 2: Single Character Search
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Single Character Search ---');
  requests.length = 0;
  controller.handleSearchChange('a');
  assert.strictEqual(requests.length, 0, 'Immediate call should not happen for single char typing');
  await sleep(300);
  assert.strictEqual(requests.length, 1, 'Exactly 1 request after 250ms');
  assert.strictEqual(requests[0].query, 'a');
  console.log('[PASS] 1-character search: Correctly debounced and executed.');

  // --------------------------------------------------------------------------
  // TEST 3: Clearing Search via 'X' Button or Empty String
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Clearing Search (Immediate Execution) ---');
  requests.length = 0;

  // Case A: User types something, then clicks 'X' immediately
  controller.handleSearchChange('abandoned query');
  controller.handleClearSearch();

  // Clearing search should fire IMMEDIATELY with query: '' and reset to page 1
  assert.strictEqual(requests.length, 1, 'Clear must execute immediately');
  assert.strictEqual(requests[0].query, '', 'Query must be cleared to empty string');
  assert.strictEqual(requests[0].page, 1, 'Page must reset to 1');
  assert.strictEqual(requests[0].immediate, true, 'Execution must be immediate without debounce');

  // Wait 300ms to ensure the abandoned query NEVER fires
  await sleep(300);
  assert.strictEqual(requests.length, 1, 'Obsolete pending search timer was cancelled; no secondary request fired');
  console.log('[PASS] Search Clear: Executed immediately and successfully cancelled obsolete pending search.');

  // --------------------------------------------------------------------------
  // TEST 4: Immediate Actions (Status / Mode / DatePreset Filters)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Non-Debounced Filter Interactions ---');
  requests.length = 0;

  controller.handleImmediateFilterChange('status', 'confirmed');
  assert.strictEqual(requests.length, 1, 'Filter change must apply immediately');
  assert.strictEqual(requests[0].status, 'confirmed');
  assert.strictEqual(requests[0].page, 1, 'Filter change must reset page to 1');
  assert.strictEqual(requests[0].immediate, true, 'Must not be debounced');

  controller.handleImmediateFilterChange('paymentMode', 'upi');
  assert.strictEqual(requests.length, 2);
  assert.strictEqual(requests[1].paymentMode, 'upi');
  console.log('[PASS] Status & Mode filters: Executed immediately without debounce delay.');

  // --------------------------------------------------------------------------
  // TEST 5: Enter Keypress (Immediate Search Submission)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Enter Key Submission ---');
  requests.length = 0;
  controller.handleSearchChange('express query');
  // User hits Enter immediately (e.g. after 30ms)
  await sleep(30);
  controller.handleKeyDownEnter();

  assert.strictEqual(requests.length, 1, 'Enter key must fire immediately');
  assert.strictEqual(requests[0].query, 'express query');
  await sleep(300);
  assert.strictEqual(requests.length, 1, 'Pending debounce timer was cancelled on Enter');
  console.log('[PASS] Enter Key: Fired immediate search and prevented duplicate debounced request.');

  // --------------------------------------------------------------------------
  // TEST 6: Stale Response Handling & Request Sequencing
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Stale Response Prevention & Race Condition Safety ---');
  
  // Simulate two server responses arriving out of order (slow older request vs fast newer request)
  let latestRenderedSeq = 0;
  let activeUIState = null;

  function handleServerResponse(response) {
    // Only accept response if its sequence number >= latestRenderedSeq
    if (response.seq > latestRenderedSeq) {
      latestRenderedSeq = response.seq;
      activeUIState = response.data;
      return true; // accepted
    } else {
      // Ignored: stale obsolete response!
      return false; // rejected
    }
  }

  // Request 1 issued at t=0 (e.g. slow query for "smith")
  const req1 = { seq: 1, data: ['Guest Smith'] };
  // Request 2 issued at t=100 (e.g. fast query for "john")
  const req2 = { seq: 2, data: ['Guest John'] };

  // Response 2 arrives FIRST:
  const accepted2 = handleServerResponse(req2);
  assert.strictEqual(accepted2, true, 'Request 2 response accepted');
  assert.deepStrictEqual(activeUIState, ['Guest John']);

  // Response 1 arrives LATER (out of order):
  const accepted1 = handleServerResponse(req1);
  assert.strictEqual(accepted1, false, 'Request 1 response MUST be rejected as stale');
  assert.deepStrictEqual(activeUIState, ['Guest John'], 'UI state must not be overwritten by stale response');
  console.log('[PASS] Stale Response Prevention: Out-of-order response sequence correctly discarded.');

  controller.cleanup();

  console.log('\n================================================================');
  console.log('       ALL SEARCH & FILTER OPTIMIZATION TESTS PASSED!           ');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('[TEST FAILURE]:', err);
  process.exit(1);
});
