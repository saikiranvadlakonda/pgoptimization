import { Injectable, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationExtras } from '@angular/router';
import { RouterProxy } from '../../../store/router/proxy/router.proxy';
import { SpinnerService } from '../../components/pg-spinner/pg-spinner.service'
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class NavigationService implements OnDestroy {
    private subscription: Subscription;

    constructor(
        private _spinnerService: SpinnerService,
        private _router: Router,
        private _location: Location,
        private routerProxy: RouterProxy

    ) {
        this._nextRoute = '';

        this.subscription = <Subscription>this._location.subscribe(path => {
            this._nextRoute = path.url;
        });
    }

    private _nextRoute: string;

    public previousRoute: string;

    public currentRoute: string;

    public routes: IRoute[] = [];

    public isNavigationSubTopic: boolean;

    navigate(view: string, stateParams?: any, extras?: NavigationExtras, isBackwardNavigation: boolean = false) {
        this.currentRoute = view;
        this._spinnerService.show();
        this._nextRoute = view;
        if (view) {
            var currentRouterContext = this._router;
            if (!isBackwardNavigation) {
                this.storeRoutes(view, currentRouterContext.routerState.snapshot.url, stateParams);

            }
            this._router.navigate([view], extras).then(() => {
                if (stateParams) {
                    this.routerProxy.dispatchRouterAction(view, stateParams);
                }
            });
        }

        if (view == this._router.routerState.snapshot.url) {
            this._spinnerService.hide();
        }

    }

    get nextRoute() {
        return this._nextRoute
    }

    set nextRoute(newRoute: string) {
        this._nextRoute = newRoute;
    }

    storeRoutes(current: string, previous: string, stateParams: any) {
        var route = this.routes.find(r => r.currentRoute == current);
        if (route) {
            this.routes.find(r => r.currentRoute == current).currentRoute = current;
            this.routes.find(r => r.currentRoute == current).previousRoute = previous;
            this.routes.find(r => r.currentRoute == current).previousRouteStateParams = stateParams;

        }
        else
            this.routes.push({ currentRoute: current, previousRoute: previous, previousRouteStateParams: stateParams });
    }

    getStateParams(view: string) {
        if (this.routes.find(r => r.currentRoute == view))
            return this.routes.find(r => r.currentRoute == view).previousRouteStateParams;
        else
            return null;
    }

    getPreviousRoute() {
        return this.routes.find(r => r.currentRoute.indexOf(this.currentRoute) > -1);
    }

    getStateByRouteName(routeName: string) {
        return this.routes.find(r => r.currentRoute == routeName);
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}

export interface IRoute {
    currentRoute: string;
    previousRoute: string;
    previousRouteStateParams: any;
}
