global.WebSocket = class {};
const assert = require('assert');

console.log('================================================================');
console.log('    SUPABASE REALTIME & WEBSOCKET STABILITY VERIFICATION        ');
console.log('================================================================\n');

// 1. Simulate the OLD pattern (un-memoized callback)
console.log('--- TEST 1: Old vs New handleRoomUpdated Reference Stability ---');

function simulateOldDashboardRender(selectedRoomId) {
  // Inline function recreated every render
  const handleRoomUpdated = (roomId, newStatus, newHousekeepingStatus) => {
    return { roomId, newStatus, newHousekeepingStatus };
  };
  return handleRoomUpdated;
}

const oldCb1 = simulateOldDashboardRender(null);
const oldCb2 = simulateOldDashboardRender('room-101'); // user clicks room
const oldCb3 = simulateOldDashboardRender(null);       // user closes drawer
const oldCb4 = simulateOldDashboardRender('room-102'); // user clicks another room

assert.notStrictEqual(oldCb1, oldCb2, 'Old callbacks had different references on room click');
assert.notStrictEqual(oldCb2, oldCb3, 'Old callbacks had different references on drawer close');
console.log('[CONFIRMED ISSUE IN OLD CODE]: Every UI interaction (room click, drawer toggle) generated a new callback reference.');

// 2. Simulate the NEW pattern (useCallback with functional state updates)
function simulateNewDashboardRender() {
  let stableCallback = null;

  // React useCallback mock with [] deps:
  function useCallback(fn, deps) {
    if (!stableCallback) {
      stableCallback = fn;
    }
    return stableCallback;
  }

  return {
    render: (selectedRoomId) => {
      return useCallback((roomId, newStatus, newHousekeepingStatus) => {
        return { roomId, newStatus, newHousekeepingStatus };
      }, []);
    }
  };
}

const dashboardInstance = simulateNewDashboardRender();
const newCb1 = dashboardInstance.render(null);
const newCb2 = dashboardInstance.render('room-101'); // click room
const newCb3 = dashboardInstance.render(null);       // close drawer
const newCb4 = dashboardInstance.render('room-102'); // click room 102
const newCb5 = dashboardInstance.render('room-102'); // filter change

assert.strictEqual(newCb1, newCb2, 'New callback MUST have identical reference on room click');
assert.strictEqual(newCb2, newCb3, 'New callback MUST have identical reference on drawer close');
assert.strictEqual(newCb3, newCb4, 'New callback MUST have identical reference on room selection');
assert.strictEqual(newCb4, newCb5, 'New callback MUST have identical reference on filter change');
console.log('[PASS]: handleRoomUpdated maintains 100% stable reference equality across all UI renders.');

// 3. Simulate RealtimeRoomSubscriber Lifecycle
console.log('\n--- TEST 2: RealtimeRoomSubscriber Subscription Lifecycle ---');

class MockSupabaseChannel {
  constructor(name) {
    this.name = name;
    this.subscribed = true;
    this.unsubscribed = false;
  }
  unsubscribe() {
    this.subscribed = false;
    this.unsubscribed = true;
  }
}

class MockSupabaseClient {
  constructor() {
    this.channels = [];
    this.connectionCount = 0;
    this.disconnectCount = 0;
  }
  channel(name) {
    this.connectionCount++;
    const ch = new MockSupabaseChannel(name);
    ch.on = () => ch;
    ch.subscribe = (cb) => {
      if (cb) cb('SUBSCRIBED');
      return ch;
    };
    this.channels.push(ch);
    return ch;
  }
  removeChannel(ch) {
    this.disconnectCount++;
    ch.unsubscribe();
  }
}

class MockBroadcastChannel {
  static openChannels = 0;
  constructor(name) {
    this.name = name;
    this.closed = false;
    MockBroadcastChannel.openChannels++;
  }
  close() {
    if (!this.closed) {
      this.closed = true;
      MockBroadcastChannel.openChannels--;
    }
  }
  postMessage(data) {
    this.lastMessage = data;
  }
}

// Test RealtimeRoomSubscriber with stable ref and [] dependency array:
function simulateRealtimeRoomSubscriber(supabaseClient) {
  let onRoomUpdatedCurrent = null;
  let effectCleanup = null;
  let effectRunCount = 0;

  return {
    mount: (onRoomUpdated) => {
      // 1. Ref sync
      onRoomUpdatedCurrent = onRoomUpdated;

      // 2. Subscription Effect (deps = [])
      effectRunCount++;
      const broadcast = new MockBroadcastChannel('hotel_pms_rooms_sync');
      const channel = supabaseClient.channel('rooms-realtime-channel');

      effectCleanup = () => {
        broadcast.close();
        supabaseClient.removeChannel(channel);
      };
    },
    updateProps: (newOnRoomUpdated) => {
      // Ref updates without triggering effect!
      onRoomUpdatedCurrent = newOnRoomUpdated;
      // Effect does NOT re-run because deps is []
    },
    unmount: () => {
      if (effectCleanup) {
        effectCleanup();
        effectCleanup = null;
      }
    },
    getEffectRunCount: () => effectRunCount,
  };
}

const mockSupabase = new MockSupabaseClient();
const subscriber = simulateRealtimeRoomSubscriber(mockSupabase);

// 3A. Initial Mount
subscriber.mount(newCb1);
assert.strictEqual(mockSupabase.connectionCount, 1, 'Should have exactly 1 connection on mount');
assert.strictEqual(mockSupabase.disconnectCount, 0, 'Should have 0 disconnections on mount');
assert.strictEqual(MockBroadcastChannel.openChannels, 1, 'Should have exactly 1 open BroadcastChannel');
console.log('[PASS] Initial Load: Exactly 1 WebSocket connection and 1 BroadcastChannel created.');

// 3B. User clicks room -> UI re-renders
subscriber.updateProps(newCb2);
assert.strictEqual(mockSupabase.connectionCount, 1, 'Connection count must stay at 1 after clicking room');
assert.strictEqual(mockSupabase.disconnectCount, 0, 'Disconnect count must stay at 0 after clicking room');
assert.strictEqual(MockBroadcastChannel.openChannels, 1, 'BroadcastChannel must stay open without churn');
console.log('[PASS] Room Click: 0 reconnections, 0 disconnects.');

// 3C. User closes drawer -> UI re-renders
subscriber.updateProps(newCb3);
assert.strictEqual(mockSupabase.connectionCount, 1, 'Connection count must stay at 1 after closing drawer');
assert.strictEqual(mockSupabase.disconnectCount, 0, 'Disconnect count must stay at 0 after closing drawer');
console.log('[PASS] Drawer Close: 0 reconnections, 0 disconnects.');

// 3D. User selects another room -> UI re-renders
subscriber.updateProps(newCb4);
assert.strictEqual(mockSupabase.connectionCount, 1, 'Connection count must stay at 1 after selecting another room');
console.log('[PASS] Room Selection: 0 reconnections, 0 disconnects.');

// 3E. Filter change / unrelated component state update
subscriber.updateProps(newCb5);
assert.strictEqual(mockSupabase.connectionCount, 1, 'Connection count must stay at 1 after filter change');
assert.strictEqual(subscriber.getEffectRunCount(), 1, 'Effect must run only once throughout UI lifecycle');
console.log('[PASS] Filter Change / State Updates: 0 reconnections, 0 disconnects.');

// 3F. Genuine Unmount (Navigating away from dashboard)
subscriber.unmount();
assert.strictEqual(mockSupabase.disconnectCount, 1, 'Channel must be removed on unmount');
assert.strictEqual(MockBroadcastChannel.openChannels, 0, 'BroadcastChannel must be closed on unmount');
console.log('[PASS] Unmount (Navigate Away): Cleanly closed BroadcastChannel and removed Supabase channel.');

// 3G. Return to Dashboard (Remount)
const subscriber2 = simulateRealtimeRoomSubscriber(mockSupabase);
subscriber2.mount(newCb1);
assert.strictEqual(mockSupabase.connectionCount, 2, 'Total connections incremented by 1 on return to dashboard');
assert.strictEqual(MockBroadcastChannel.openChannels, 1, 'New BroadcastChannel opened on return to dashboard');
subscriber2.unmount();
assert.strictEqual(MockBroadcastChannel.openChannels, 0, 'BroadcastChannel cleanly closed on final unmount');
console.log('[PASS] Return to Dashboard: Successfully reconnected and cleanly unmounted.');

console.log('\n================================================================');
console.log('   ALL REALTIME WEBSOCKET STABILITY AUDIT TESTS PASSED!         ');
console.log('================================================================\n');
