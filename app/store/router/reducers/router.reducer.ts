import { RouterAction, RouterActions } from '../actions/router.action';
import { StateParams } from '../../../shared/models/state-params/state-params.model';

export function routerReducer(state: StateParams, action: RouterAction): StateParams {
    switch (action.type) {
        case RouterActions.Account.MOVE_TO_LOGIN:
        case RouterActions.Header2.MOVE_TO_PRACTICE_AREAS:
        case RouterActions.Header2.MOVE_TO_SEARCH_RESULTS:
        case RouterActions.Dashboard.MOVE_TO_DASHBOARD:
        case RouterActions.SubTopics.MOVE_TO_SUB_TOPICS:
        case RouterActions.GuidanceNote.MOVE_TO_GUIDANCE_NOTE:
        case RouterActions.GuidanceNote.MOVE_TO_GUIDANCE_NOTE_DETAIL:
        case RouterActions.Folders.MOVE_TO_MY_FOLDERS:
        case RouterActions.Folders.MOVE_TO_FOLDER_DETAILS:
        case RouterActions.History.MOVE_TO_HISTORY_LIST:
        case RouterActions.WhatsNew.MOVE_TO_WHATS_NEW:
            {
                return Object.assign({}, new StateParams(action.payload.viewModel));
            }
    }

    return state;
}

export const getStateViewModel = (state: StateParams) => (state && state.viewModel);
