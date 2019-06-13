import { Action } from '@ngrx/store';
import { StateParams } from '../../../shared/models/state-params/state-params.model';
import { PgConstants } from '../../../shared/constants/pg.constants';

export class RouterAction implements Action {
    type: string;
    constructor(public payload: StateParams) { }
}

export class RouterActions {

    public static Account = {
        MOVE_TO_LOGIN: PgConstants.constants.URLS.Account.Login
    }
    public static Header2 = {

        MOVE_TO_PRACTICE_AREAS: PgConstants.constants.URLS.Header2.PracticeAreas,
        MOVE_TO_SEARCH_RESULTS: PgConstants.constants.URLS.Header2.SearchResults
    }

    public static Dashboard = {

        MOVE_TO_DASHBOARD: PgConstants.constants.URLS.Dashboard.Dashboard,
    }

    public static SubTopics = {

        MOVE_TO_SUB_TOPICS: PgConstants.constants.URLS.SubTopics.SubTopics
    }
    public static GuidanceNote = {

        MOVE_TO_GUIDANCE_NOTE: PgConstants.constants.URLS.GuidanceNote.GuidanceNote,
        MOVE_TO_GUIDANCE_NOTE_DETAIL: PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail
    }

    public static Folders = {

        MOVE_TO_MY_FOLDERS: PgConstants.constants.URLS.Folders.MyFolders,
        MOVE_TO_FOLDER_DETAILS: PgConstants.constants.URLS.Folders.FolderDetails
  }

  public static History = {
    MOVE_TO_HISTORY_LIST: PgConstants.constants.URLS.History.HistoryList
  }

    public static WhatsNew = {
        MOVE_TO_WHATS_NEW: PgConstants.constants.URLS.WhatsNew.WhatsNew
    }

} 
