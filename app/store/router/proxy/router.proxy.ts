import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { StateParams } from '../../../shared/models/state-params/state-params.model';
import { getRouterState, getViewModel } from '../selectors/router.selector';

@Injectable()
export class RouterProxy {
    constructor(private store: Store<StateParams>) { }

    public getRouterState(): Observable<StateParams> {
        return this.store.select(getRouterState);
    }

    public getViewModel(): Observable<any> {
        return this.store.select(getViewModel);
    }

    public dispatchRouterAction(action, stateParams) {
        this.store.dispatch({ type: action, payload: stateParams });
    }

}