import { Action } from 'history';
import { createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RouterHistory } from './routerHistory';

describe('RouterHistory compatibility', () => {
    it('preserves history actions, state, URLs and listener cleanup', async () => {
        const router = createMemoryRouter([{ path: '*', element: null }]);
        const history = new RouterHistory(router);
        const listener = vi.fn();
        const unlisten = history.listen(listener);

        expect(history.action).toBe(Action.Pop);
        await router.navigate('/library?tab=movies', { state: { synthetic: true } });
        expect(history.action).toBe(Action.Push);
        expect(history.location.pathname).toBe('/library');
        expect(history.location.state).toEqual({ synthetic: true });
        expect(history.createHref('/login')).toBe('/login');
        expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ action: Action.Push }));

        await router.navigate('/login', { replace: true });
        expect(history.action).toBe(Action.Replace);
        expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ action: Action.Replace }));

        unlisten();
        listener.mockClear();
        await router.navigate(-1);
        expect(history.action).toBe(Action.Pop);
        expect(listener).not.toHaveBeenCalled();
        router.dispose();
    });
});
