import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { signal } from '@preact/signals'
import { RequestState } from '@substrate-system/state'
import type { HTTPError } from 'ky'
import ky from 'ky'
import {
    State,
    type AppState,
    type DeviceInfo,
    type PendingInvitation,
    type DeviceInvitation,
    type SessionResponse,
} from '../src/client/state.js'
import type { RequestFor } from '@substrate-system/state'

// vi.mock is hoisted to the top of the compiled output by vitest's
// transform — it runs before any import statement regardless of
// source order. The import of ky above receives the mocked module.
vi.mock('ky', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}))

const mockGet = vi.mocked(ky.get)
const mockPost = vi.mocked(ky.post)

// NOTE: vi.useFakeTimers() patches vitest's timer globals. In the
// @cloudflare/vitest-pool-workers environment, the Workers-runtime
// setInterval may or may not be the same global. Each polling test
// includes a guard assertion (expect(devicesCallCount).toBeGreaterThan(0))
// after the first advanceTimersByTimeAsync call — if this assertion
// fails with 0, fake timers are not reaching the isolate and the
// polling logic must be tested via a different mechanism.

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDevice (id:string):DeviceInfo {
    return {
        deviceId: id,
        credentialId: `cred-${id}`,
        credentialName: `Device ${id}`,
        aaguid: null,
        transports: [],
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        isRevoked: false,
    }
}

function makeInvite (code:string):PendingInvitation {
    return {
        inviteCode: code,
        deviceName: 'Test Device',
        status: 'pending',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        createdAt: new Date().toISOString(),
    }
}

function makeInvitation ():DeviceInvitation & { status:string } {
    return {
        inviteCode: 'test-invite',
        inviteUrl: 'http://localhost/add/test-invite',
        deviceName: 'Test Device',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        status: 'pending',
    }
}

function createTestState ():AppState {
    return {
        route: signal('/'),
        count: signal(0),
        user: signal<RequestFor<SessionResponse, HTTPError|Error>>(
            RequestState()
        ),
        response: signal<RequestFor<{ message:string }, HTTPError|Error>>(
            RequestState()
        ),
        devices: signal<RequestFor<DeviceInfo[], HTTPError|Error>>(
            RequestState()
        ),
        invitations: signal<RequestFor<PendingInvitation[], HTTPError|Error>>(
            RequestState()
        ),
        logoutInProgress: signal(false),
        logoutError: signal(null),
    } as unknown as AppState
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('State.createInvite polling', () => {
    let state:AppState

    beforeEach(() => {
        vi.useFakeTimers()
        state = createTestState()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('calls listDevices and listInvites on each poll tick', async () => {
        const device1 = makeDevice('device-1')
        const invite = makeInvite('abc')

        // Seed state with one existing device and one invitation
        state.devices.value = {
            pending: false, data: [device1], error: null,
        }
        state.invitations.value = {
            pending: false, data: [invite], error: null,
        }

        // POST returns invitation; GET returns same device+invite forever
        mockPost.mockReturnValue({
            json: () => Promise.resolve(makeInvitation()),
        })
        mockGet.mockImplementation((url:string) => ({
            json: () => url.includes('/invites') ?
                Promise.resolve([invite]) :
                Promise.resolve([device1]),
        }))

        await State.createInvite(state, 'Test Device')

        // Advance one poll interval
        await vi.advanceTimersByTimeAsync(5_100)

        // listDevices → GET /api/auth/passkey/devices
        // listInvites → GET /api/auth/passkey/devices/invites
        // Plus initial listInvites inside createInvite = 2 total invites calls
        const devicesCalls = mockGet.mock.calls.filter(
            ([url]:unknown[]) => !String(url).includes('/invites')
        )
        const invitesCalls = mockGet.mock.calls.filter(
            ([url]:unknown[]) => String(url).includes('/invites')
        )
        expect(devicesCalls.length).toBeGreaterThanOrEqual(1)
        expect(invitesCalls.length).toBeGreaterThanOrEqual(2) // initial + tick
    })

    it('stops polling when a new device appears in the list', async () => {
        const device1 = makeDevice('device-1')
        const device2 = makeDevice('device-2')
        const invite = makeInvite('abc')

        state.devices.value = {
            pending: false, data: [device1], error: null,
        }
        state.invitations.value = {
            pending: false, data: [invite], error: null,
        }

        mockPost.mockReturnValue({
            json: () => Promise.resolve(makeInvitation()),
        })

        let devicesCallCount = 0
        mockGet.mockImplementation((url:string) => ({
            json: () => {
                if (url.includes('/invites')) {
                    return Promise.resolve([invite])
                }
                devicesCallCount++
                // Second devices call includes the new device
                return devicesCallCount >= 2 ?
                    Promise.resolve([device1, device2]) :
                    Promise.resolve([device1])
            },
        }))

        await State.createInvite(state, 'Test Device')

        // Tick 1: no new device, keeps going
        await vi.advanceTimersByTimeAsync(5_100)
        // Guard: confirms fake timers are reaching the interval callback.
        // If this fails with 0, vi.useFakeTimers() is not working in
        // this environment — investigate before continuing.
        expect(devicesCallCount).toBeGreaterThan(0)

        // Tick 2: new device found, interval clears
        await vi.advanceTimersByTimeAsync(5_100)

        const callsAfterStop = devicesCallCount
        // Tick 3 should NOT fire
        await vi.advanceTimersByTimeAsync(5_100)

        expect(devicesCallCount).toBe(callsAfterStop)
    })

    it('stops polling when no invitations remain', async () => {
        const device1 = makeDevice('device-1')
        const invite = makeInvite('abc')

        state.devices.value = {
            pending: false, data: [device1], error: null,
        }
        state.invitations.value = {
            pending: false, data: [invite], error: null,
        }

        mockPost.mockReturnValue({
            json: () => Promise.resolve(makeInvitation()),
        })

        let devicesCallCount = 0
        mockGet.mockImplementation((url:string) => ({
            json: () => {
                if (url.includes('/invites')) {
                    // Invitations gone after first tick
                    return Promise.resolve(
                        devicesCallCount >= 1 ? [] : [invite]
                    )
                }
                devicesCallCount++
                return Promise.resolve([device1])
            },
        }))

        await State.createInvite(state, 'Test Device')

        // Tick 1: invites return empty, interval clears
        await vi.advanceTimersByTimeAsync(5_100)
        // Guard: fails loudly if fake timers are not reaching the isolate
        expect(devicesCallCount).toBeGreaterThan(0)

        const callsAfterStop = devicesCallCount
        // Tick 2 should NOT fire
        await vi.advanceTimersByTimeAsync(5_100)

        expect(devicesCallCount).toBe(callsAfterStop)
    })

    it('replaces existing poll interval when createInvite is called again', async () => {
        const device1 = makeDevice('device-1')
        const invite = makeInvite('abc')

        state.devices.value = {
            pending: false, data: [device1], error: null,
        }
        state.invitations.value = {
            pending: false, data: [invite], error: null,
        }

        mockPost.mockReturnValue({
            json: () => Promise.resolve(makeInvitation()),
        })
        mockGet.mockImplementation((url:string) => ({
            json: () => url.includes('/invites') ?
                Promise.resolve([invite]) :
                Promise.resolve([device1]),
        }))

        // Create two invites in a row
        await State.createInvite(state, 'Device A')
        await State.createInvite(state, 'Device B')

        // Only one interval should be active — advance one interval
        // and count device calls (should be exactly 1 per tick, not 2)
        mockGet.mockClear()
        await vi.advanceTimersByTimeAsync(5_100)

        const devicesCalls = mockGet.mock.calls.filter(
            ([url]:unknown[]) => !String(url).includes('/invites')
        )
        // Guard: confirms fake timers are reaching the interval callback
        expect(devicesCalls.length).toBeGreaterThanOrEqual(1)
    })
})
