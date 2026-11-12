/* eslint-disable @typescript-eslint/no-explicit-any */
import type { createHashRouter, RouterState } from 'react-router-dom';
import { Action, type History, type Listener, type To } from 'history';

import Events, { type Event } from 'utils/events';

const HISTORY_UPDATE_EVENT = 'HISTORY_UPDATE';
type Router = ReturnType<typeof createHashRouter>;
const HISTORY_ACTIONS = { POP: Action.Pop, PUSH: Action.Push, REPLACE: Action.Replace };

export class RouterHistory implements History {
    _router: Router;
    createHref: (arg: any) => string;

    constructor(router: Router) {
        this._router = router;

        this._router.subscribe(state => {
            console.debug('[RouterHistory] history update', state);
            Events.trigger(document, HISTORY_UPDATE_EVENT, [ state ]);
        });

        this.createHref = router.createHref;
    }

    get action() {
        return HISTORY_ACTIONS[this._router.state.historyAction];
    }

    get location() {
        return this._router.state.location;
    }

    back() {
        void this._router.navigate(-1);
    }

    forward() {
        void this._router.navigate(1);
    }

    go(delta: number) {
        void this._router.navigate(delta);
    }

    push(to: To, state?: any) {
        void this._router.navigate(to, { state });
    }

    replace(to: To, state?: any): void {
        void this._router.navigate(to, { state, replace: true });
    }

    block() {
        // NOTE: We don't seem to use this functionality, so leaving it unimplemented.
        throw new Error('`history.block()` is not implemented');
        return () => undefined;
    }

    listen(listener: Listener) {
        const compatListener = (_e: Event, state: RouterState) => {
            return listener({ action: HISTORY_ACTIONS[state.historyAction], location: state.location });
        };

        Events.on(document, HISTORY_UPDATE_EVENT, compatListener);

        return () => Events.off(document, HISTORY_UPDATE_EVENT, compatListener);
    }
}

export const createRouterHistory = (router: Router): History => {
    return new RouterHistory(router);
};

/* eslint-enable @typescript-eslint/no-explicit-any */
