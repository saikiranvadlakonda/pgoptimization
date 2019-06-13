//TODO: Need  to be removed at the time of deployment. Just keeping it for angular mode running
import BackendHost from './backendhost';

export class PgConstants {

  public static constants = {
    

        WEBAPIURLS: {

        GetPracticeAreas: BackendHost.getInstance().getHost() + 'api/secured/practiceArea/getPracticeAreas',
            GetPracticeAreasOnly: BackendHost.getInstance().getHost() + 'api/secured/practiceArea/getPracticeAreasByZoneId',
            GetSearchResults: BackendHost.getInstance().getHost() + 'api/secured/search/getResults',
            GetSubTopic: BackendHost.getInstance().getHost() + 'api/secured/topic/getSubTopic',
            GetHomeContentForPracticeArea: BackendHost.getInstance().getHost() + 'api/secured/practiceArea/getContentForPracticeArea',
            GetHomeContentForSubTopic: BackendHost.getInstance().getHost() + 'api/secured/practiceArea/getHomeContentForSubTopic',
            GetHistoryItems: BackendHost.getInstance().getHost() + 'api/secured/History/getHistoryItems',
            GetAllHistoryItems: BackendHost.getInstance().getHost() + 'api/secured/History/getAllHistoryItems',
            GetCalendarEvents: BackendHost.getInstance().getHost() + 'api/secured/Calendar/getCalendarEvents',
            GetContentView: BackendHost.getInstance().getHost() + 'api/secured/content/getContentView',
            GetContentGuidanceDetails: BackendHost.getInstance().getHost() + 'api/secured/content/getContentGuidanceDetails',
            GetDownloadContent: BackendHost.getInstance().getHost() + 'api/secured/content/getDownloadContent',
            GetRepository: BackendHost.getInstance().getHost() + 'api/secured/Repository/GetFoldersInfo',
            GetRepositoryAll: BackendHost.getInstance().getHost() + 'api/secured/Repository/GetFoldersInfoMyfolder',
            GetRepositoryFile: BackendHost.getInstance().getHost() + 'api/secured/Repository/GetFileInfo',
            CreateClient: BackendHost.getInstance().getHost() + 'api/secured/Repository/CreateClient',
            CreateFolder: BackendHost.getInstance().getHost() + 'api/secured/Repository/CreateFolder',
            UpdateClient: BackendHost.getInstance().getHost() + 'api/secured/Repository/UpdateClient',
            UpdateFolder: BackendHost.getInstance().getHost() + 'api/secured/Repository/UpdateFolder',
            CreateDocumentFile: BackendHost.getInstance().getHost() + 'api/secured/Repository/CreateDocument',
            DeleteFolderFile: BackendHost.getInstance().getHost() + 'api/secured/Repository/DeleteDocumentByID',
            DeleteFolder: BackendHost.getInstance().getHost() + 'api/secured/Repository/DeleteFolderByID',
            DeleteClient: BackendHost.getInstance().getHost() + 'api/secured/Repository/DeleteClientByID',
            GetAllEssential: BackendHost.getInstance().getHost() + 'api/secured/practiceArea/getAllEssential',
            GetEssential: BackendHost.getInstance().getHost() + 'api/secured/practiceArea/getEssential',
            GetWhatsNew: BackendHost.getInstance().getHost() + 'api/secured/WhatsNew/getWhatNewForPracticeArea',
            GetAllWhatsNew: BackendHost.getInstance().getHost() + 'api/secured/WhatsNew/getAllWhatNew',
            Authenticate: BackendHost.getInstance().getHost() + 'api/anon/account/token',
            Logout: BackendHost.getInstance().getHost() + 'api/anon/account/logout',
            GetUserInfo: BackendHost.getInstance().getHost() + 'api/secured/user/GetUserInfo',
            GetRootFolders: BackendHost.getInstance().getHost() + 'api/secured/Repository/getRootFolders',
            GetSelectedFoldersFiles: BackendHost.getInstance().getHost() + 'api/secured/Repository/getSelectedFoldersFiles',
            SendContentEmail: BackendHost.getInstance().getHost() + 'api/secured/content/sendContentEmail',
            searchInAllFolders: BackendHost.getInstance().getHost() + 'api/secured/Repository/SearchFolders',
            searchInFolder: BackendHost.getInstance().getHost() + 'api/secured/Repository/SearchFoldersById',
            GetImageContent: BackendHost.getInstance().getHost() + 'api/secured/content/getImageContent',
            GetContent: BackendHost.getInstance().getHost() + 'api/secured/content/getContent',
            GetIntroByDomainID: BackendHost.getInstance().getHost() + 'api/secured/practiceArea/getIntroByDomainID',
            SendFeedback: BackendHost.getInstance().getHost() + 'api/secured/user/SubmitFeedback',
            GetAllLatestWhatsNew: BackendHost.getInstance().getHost() + 'api/secured/WhatsNew/getAllLatestWhatNew',
            GetPermaLink: BackendHost.getInstance().getHost() + 'api/secured/Document/getPermaLink',
            GetPermaLinkData: BackendHost.getInstance().getHost() + 'api/secured/Document/getPermalinkContent',
            GetHistoryItemsByPA: BackendHost.getInstance().getHost() + 'api/secured/History/getHistoryItemsByPA',
            GetHistoryItemsByPaPeriod: BackendHost.getInstance().getHost() + 'api/secured/History/getHistoryItemsByPaPeriod',
            GetContentType: BackendHost.getInstance().getHost() + 'api/secured/content/getContentType',
            GetPermalinkContentViewData: BackendHost.getInstance().getHost() + 'api/secured/Document/getPermalinkContentViewData',
            FindNewsItemContentType: BackendHost.getInstance().getHost() + 'api/secured/WhatsNew/findNewsItemContentType',
            HasAccessToContent: BackendHost.getInstance().getHost() + 'api/secured/content/hasAccessToContent',
            GetWhatsNewDetail: BackendHost.getInstance().getHost() + 'api/secured/WhatsNew/getWhatsNewDetail',
            FindSubscribedNews: BackendHost.getInstance().getHost() + 'api/secured/WhatsNew/FindSubscribedNews',
            RedirectToLib: BackendHost.getInstance().getHost() + 'api/anon/account/RedirectToLibrary',
            LogSearchContentViewRequest: BackendHost.getInstance().getHost() + 'api/secured/analytics/logSearchContentViewRequest',
            GetPdfStream: '/api/anon/account/getPDFStream/',
            GetSearchFilters:  BackendHost.getInstance().getHost() + 'api/secured/search/getSearchFilters',
        },

        URLS: {
            Account: {
                'Login': '/login',
            },
            Header2: {

                'PracticeAreas': 'practice-areas',
                'SearchResults': '/search-results'
            },
            Dashboard: {
                Dashboard: '/dashboard'
            },
            SubTopics: {
                'SubTopics': '/sub-topics',
            },
            GuidanceNote: {
                'GuidanceNote': '/guidance-note',
                'GuidanceNoteDetail': 'guidance-note/guidance-note-detail'
            },
            Folders: {
                'MyFolders': 'folders/my-folders',
                'FolderDetails': 'folders/folder-details'
            },
            History: {
                'HistoryList': '/history-list'
            },
            Calendar: {
                Calendar: '/calendar'
            },
            Essential: {
                Essential: '/essential'
            },
            WhatsNew: {
                WhatsNew: '/whats-new'
            },
            ContentView: {
                ContentView: '/content-view'
            },
            PermalinkView: {
                Permalink:'permalink-view'
            }
        },

        Colors: {
            //court order date
            COTD: {
                primary: '#d74b4b',
                secondary: ''
            },
            //event
            EVT: {
                primary: '#4169E1',
                secondary: ''
            },
            //seminar date 
            SMNR: {
                primary: '#d9b94f',
                secondary: ''
            },
            //important date
            IMPD: {
                primary: '#5cb85c',
                secondary: ''
            }
        },
        EventType: {
            COTD: "Court Order",
            EVT: "Event",
            SMNR: "Seminar",
            IMPD: "Important"
        },
        EventTypeClass: {
            COTD: "courtOrderCls",
            EVT: "eventCls",
            SMNR: "seminarCls",
            IMPD: "importantCls"
        },
        ContentPageType: {
            Content : 0,
            PractiseArea : 1,
            Topic : 2,
            SubTopic : 3
        }

    };
}
