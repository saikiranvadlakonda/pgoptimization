import { createFeatureSelector, createSelector } from '@ngrx/store';
import { getStateViewModel } from '../reducers/router.reducer';
import { StateParams } from '../../../shared/models/state-params/state-params.model';

export const getRouterState = createFeatureSelector<StateParams>("routerState");
export const getViewModel = createSelector(getRouterState, getStateViewModel);
