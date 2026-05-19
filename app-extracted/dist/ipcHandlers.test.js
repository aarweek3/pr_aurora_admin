"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const electron_1 = require("./__mocks__/electron");
vitest_1.vi.mock('electron');
vitest_1.vi.mock('electron-updater');
// Capture registered handlers so we can invoke them in tests
const handlers = new Map();
vitest_1.vi.mocked(electron_1.ipcMain.handle).mockImplementation((channel, handler) => {
    handlers.set(channel, handler);
});
// Import after mocks are in place
const ipcHandlers_1 = require("./ipcHandlers");
(0, vitest_1.describe)('ipcHandlers — notifications', () => {
    (0, vitest_1.beforeEach)(() => {
        handlers.clear();
        vitest_1.vi.clearAllMocks();
        (0, ipcHandlers_1.registerIpcHandlers)({});
    });
    (0, vitest_1.describe)('notification:send', () => {
        (0, vitest_1.it)('should create and show a Notification with the given options', () => {
            const handler = handlers.get('notification:send');
            const options = {
                id: 'test-1',
                title: 'Test Title',
                body: 'Test Body',
                silent: true,
            };
            handler({ sender: { send: vitest_1.vi.fn() } }, options);
            (0, vitest_1.expect)(electron_1.Notification).toHaveBeenCalledWith({
                title: 'Test Title',
                body: 'Test Body',
                silent: true,
            });
            (0, vitest_1.expect)(electron_1.Notification._mockInstance.show).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should default silent to false when not specified', () => {
            const handler = handlers.get('notification:send');
            handler({ sender: { send: vitest_1.vi.fn() } }, { id: 'test-2', title: 'T', body: 'B' });
            (0, vitest_1.expect)(electron_1.Notification).toHaveBeenCalledWith({
                title: 'T',
                body: 'B',
                silent: false,
            });
        });
        (0, vitest_1.it)('should register a click handler that focuses the window', () => {
            const handler = handlers.get('notification:send');
            handler({ sender: { send: vitest_1.vi.fn() } }, { id: 'test-3', title: 'T', body: 'B' });
            // Verify 'click' listener was registered
            (0, vitest_1.expect)(electron_1.Notification._mockInstance.on).toHaveBeenCalledWith('click', vitest_1.expect.any(Function));
            // Simulate click
            const clickHandler = vitest_1.vi.mocked(electron_1.Notification._mockInstance.on).mock
                .calls[0][1];
            const mockWin = electron_1.BrowserWindow.getAllWindows()[0];
            Object.assign(mockWin, {
                isMinimized: vitest_1.vi.fn().mockReturnValue(true),
                restore: vitest_1.vi.fn(),
                show: vitest_1.vi.fn(),
                focus: vitest_1.vi.fn(),
            });
            clickHandler();
            (0, vitest_1.expect)(mockWin.isMinimized).toHaveBeenCalled();
            (0, vitest_1.expect)(mockWin.restore).toHaveBeenCalled();
            (0, vitest_1.expect)(mockWin.show).toHaveBeenCalled();
            (0, vitest_1.expect)(mockWin.focus).toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('notification:open-system-preferences', () => {
        (0, vitest_1.it)('should call shell.openExternal on macOS', () => {
            // Override platform for this test
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin' });
            const handler = handlers.get('notification:open-system-preferences');
            handler({});
            (0, vitest_1.expect)(electron_1.shell.openExternal).toHaveBeenCalledWith('x-apple.systempreferences:com.apple.preference.notifications');
            // Restore
            Object.defineProperty(process, 'platform', { value: originalPlatform });
        });
        (0, vitest_1.it)('should not call shell.openExternal on non-macOS', () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'linux' });
            const handler = handlers.get('notification:open-system-preferences');
            handler({});
            (0, vitest_1.expect)(electron_1.shell.openExternal).not.toHaveBeenCalled();
            Object.defineProperty(process, 'platform', { value: originalPlatform });
        });
    });
});
