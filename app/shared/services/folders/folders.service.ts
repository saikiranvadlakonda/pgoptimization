import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError } from 'rxjs/operators';
import { PgConstants } from '../../constants/pg.constants';
import { FolderInfoViewModel, FolderFileInfoViewModel } from '../../models/Repository/folderInfo.model';
import { CreateFolerViewModel } from '../../models/Repository/Create.model';
import { SubscriberFolderEntity } from '../../models/folder';

@Injectable()
export class FoldersService {
    txtcreatefolder: string;
    constructor(private http: HttpClient) { }
    //
    getRootFolders(): Observable<SubscriberFolderEntity[]> {
        return this.http.get<SubscriberFolderEntity[]>(PgConstants.constants.WEBAPIURLS.GetRootFolders, { withCredentials: false })
            .pipe(
            timeout(300000),
            catchError((error: Response) => Observable.throw(error))
            );
    }
    getSelectedFoldersFiles(subscriberClientId): Observable<any> {
        return this.http.get<SubscriberFolderEntity[]>(PgConstants.constants.WEBAPIURLS.GetSelectedFoldersFiles + "/" + subscriberClientId, { withCredentials: false })
            .pipe(
            timeout(300000),
            catchError((error: Response) => Observable.throw(error))
            );
    }
    getFoldersByClientID(subscriberClientId): Observable<SubscriberFolderEntity[]> {
        return this.http.get<SubscriberFolderEntity[]>(PgConstants.constants.WEBAPIURLS.GetRepository, { withCredentials: false })
            .pipe(
            timeout(300000),
            catchError((error: Response) => Observable.throw(error))
            );
    }
    getFolders(): Observable<SubscriberFolderEntity[]> {
        return this.http.get<SubscriberFolderEntity[]>(PgConstants.constants.WEBAPIURLS.GetRepository, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    getFoldersAll(): Observable<FolderInfoViewModel> {
        return this.http.get<FolderInfoViewModel>(PgConstants.constants.WEBAPIURLS.GetRepositoryAll, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }
    getFile(subscriberClientId) {
        let subscriberClientID = new HttpParams().set('subscriberClientID', subscriberClientId);
        return this.http.get<FolderFileInfoViewModel>(PgConstants.constants.WEBAPIURLS.GetRepositoryFile, {
            //headers: OPTIONS.headers,
            responseType: 'json',
            params: subscriberClientID
        });
    }

    CreateClient(CreateFolerViewModel): Observable<CreateFolerViewModel> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.CreateClient, CreateFolerViewModel, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    UpdateClient(CreateFolerViewModel): Observable<CreateFolerViewModel> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.UpdateClient, CreateFolerViewModel, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    DeleteClient(CreateFolerViewModel): Observable<CreateFolerViewModel> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.DeleteClient, CreateFolerViewModel, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    CreateFolder(CreateFolerViewModel): Observable<CreateFolerViewModel> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.CreateFolder, CreateFolerViewModel, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    CreateDocument(CreateFolerViewModel): Observable<CreateFolerViewModel> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.CreateDocumentFile, CreateFolerViewModel, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    UpdateFolder(CreateFolerViewModel): Observable<CreateFolerViewModel> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.UpdateFolder, CreateFolerViewModel, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    DeleteFolderFile(FolderContentId) {
        let httpParams: HttpParams = new HttpParams().set("FolderContentID", FolderContentId);
        return this.http.post(PgConstants.constants.WEBAPIURLS.DeleteFolderFile, void (0), { params: httpParams });
    }

    DeleteFolder(FolderContentId) {
        let httpParams: HttpParams = new HttpParams().set("folderNameID", FolderContentId);
        return this.http.post(PgConstants.constants.WEBAPIURLS.DeleteFolder, void (0), { params: httpParams });
    }

    public getHomeContentForPractiseArea(input): Observable<any> {
        var url = PgConstants.constants.WEBAPIURLS.GetHomeContentForPracticeArea;
        return this.http.post<any>(url, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    };

    SearchInFolder(input): Observable<any> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.searchInFolder, input, { withCredentials: false })
            .pipe(
            timeout(300000),
            catchError((error: Response) => Observable.throw(error))
            );
    }

    SearchAllFolder(input): Observable<any> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.searchInAllFolders, input, { withCredentials: false })
            .pipe(
            timeout(300000),
            catchError((error: Response) => Observable.throw(error))
            );
    }
}
