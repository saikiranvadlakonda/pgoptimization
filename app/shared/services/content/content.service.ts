import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError } from 'rxjs/operators';
import { PgConstants } from '../../constants/pg.constants';
import { Base64 } from 'js-base64';
import { NewItemEntity } from '../../../shared/models/whats-new/new-group.model';
import { DataStoreService } from '../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { StateParams } from '../../../shared/models/state-params/state-params.model';
import { EssentialService } from '../../../shared/services/essential/essential-service';
import { ContentInfo } from '../../../shared/models/content/contentInfo.model';
import { DownloadContentInfo } from '../../../shared/models/content/contentInfo.model';
import { GuidanceNoteService } from '../../../shared/services/guidance-note/guidance-note.service';
import { TocItemViewModel } from '../../../shared/models/practiceAreas';

@Injectable()
export class ContentService {
    essentials;
    practiceArea: string = "";
    rootArea: string = "";
    practiceAreas: TocItemViewModel[];
    constructor(private http: HttpClient,
        private _dataStoreService: DataStoreService,
        private _navigationService: NavigationService,
        private _essentialService: EssentialService,
        private _guidanceNoteService: GuidanceNoteService

    ) { }

    public contentGuidanceDetails(input): Observable<any> {
        let headers = new HttpHeaders().append('Accept', 'text/html');
        var url = PgConstants.constants.WEBAPIURLS.GetContentGuidanceDetails;
        return this.http.post(url, input, { headers: headers, withCredentials: false, responseType: "text" })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    };

    public downloadContent(input): Observable<any> {
        var url = PgConstants.constants.WEBAPIURLS.GetDownloadContent;
        return this.http.post(url, input, { withCredentials: false, responseType: "json" })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    };

    public contentView(input): Observable<any> {
        var url = PgConstants.constants.WEBAPIURLS.GetContentView;
        var options = {};
        options['params'] = Object.keys(input).map(k => k + "=" + input[k]).join("&");

        return this.http.get(url, input)
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    };

    ReturnContentType(fileExtension: string) {
        switch (fileExtension) {
            case ".htm":
            case ".html":
            case ".log":
                return "text/HTML";
            case ".txt":
                return "text/plain";
            case ".doc":
            case ".docx":
                return "application/ms-word";
            case ".tiff":
            case ".tif":
                return "image/tiff";
            case ".asf":
                return "video/x-ms-asf";
            case ".avi":
                return "video/avi";
            case ".zip":
                return "application/zip";
            case ".xls":
            case ".xlsx":
            case ".csv":
                return "application/vnd.ms-excel";
            case ".gif":
                return "image/gif";
            case ".png":
                return "image/png";
            case ".jpg":
            case "jpeg":
                return "image/jpeg";
            case ".bmp":
                return "image/bmp";
            case ".wav":
                return "audio/wav";
            case ".mp3":
                return "audio/mpeg3";
            case ".mpg":
            case "mpeg":
                return "video/mpeg";
            case ".rtf":
                return "application/rtf";
            case ".asp":
                return "text/asp";
            case ".pdf":
                return "application/pdf";
            case ".fdf":
                return "application/vnd.fdf";
            case ".ppt":
            case ".pptx":
                return "application/mspowerpoint";
            case ".dwg":
                return "image/vnd.dwg";
            case ".msg":
                return "application/msoutlook";
            case ".xml":
            case ".sdxl":
                return "application/xml";
            case ".xdp":
                return "application/vnd.adobe.xdp+xml";
            default:
                return "application/octet-stream";
        }
    }

    downloadattachment(data: any, filename: string, Mimetype: string) {

        var blobObject;
        if (data.length > 0) {
            //conversion for files retrieved from DB
            var byteCharacters = Base64.atob(data);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            blobObject = new Blob([(byteArray)], { type: Mimetype })
        }
        else
            blobObject = new Blob([data], { type: Mimetype });

        if (window.navigator.msSaveOrOpenBlob) { // IE
            window.navigator.msSaveOrOpenBlob(blobObject, filename);
        }

        else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) { //Safari
            let url = URL.createObjectURL(blobObject);
            window.open(url);
        }
        else {//others
            let downloadLink = document.createElement("a");
            let url = URL.createObjectURL(blobObject);
            downloadLink.href = url;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

    getHtmlContent(data: any) {
        var html = "";
        if (data.length > 0)
            html = Base64.atob(data);
        return html;
    }

    getStrHtmlContent(data: any) {
        var content = "";
        if (data.length > 0)
            content = data;
        return content;
    }

    cleanUpHTML(input: string): string {
        input = input.replace(new RegExp('<p', 'g'), "<div");
        input = input.replace(new RegExp('</p>', 'g'), "</div><br />");
        input = input.replace(new RegExp('&#xD;&#xA;&#x9;&#x9;&#x9;&#x9;&#x9;', 'g'), "");
        input = input.replace(new RegExp('&#x9;', 'g'), "");
        input = input.replace(new RegExp('[^\u0000-\u007F]', 'g'), ' ');

        return input;
    }
    buildHtml(input: string): string {
        let regex1 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...','PGS/ContentView.aspx[?]dpath[=]`);
        let regex2 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...', 'Library/ContentView.aspx[?]dpath[=]`);
        let regex3 = new RegExp(`src[=]"/Content/ContentResponse.aspx[?]dpath[=]`);

        input = input.replace(new RegExp('<p', 'g'), "<div");
        input = input.replace(new RegExp('</p>', 'g'), "</div><br />");
        input = input.replace(new RegExp('&#xD;&#xA;&#x9;&#x9;&#x9;&#x9;&#x9;', 'g'), "");
        input = input.replace(new RegExp('&#13;&#10;&#9;&#9;&#9;&#9;&#9;', 'g'), "");
        input = input.replace(new RegExp('&#xD;&#xA;            ', 'g'), "");
        input = input.replace(new RegExp('&#xA;            ', 'g'), "");
        input = input.replace(new RegExp('&#xA;', 'g'), "");
        input = input.replace(new RegExp('&#x9;', 'g'), "");
        input = input.replace(new RegExp(`onclick="openLContent`, 'g'), `(click)="openLContent`);
        input = input.replace(new RegExp(`onclick="openMVContent`, 'g'), `(click)="openMVContent`);
        input = input.replace(new RegExp(regex1, 'g'), `(click)="openDContent('`);
        input = input.replace(new RegExp(regex2, 'g'), `(click)="openDContent('`);
        input = input.replace(new RegExp(`href="#`, 'g'), `class="underLine`);
        input = input.replace(new RegExp('[^\u0000-\u007F]', 'g'), ' ');
        input = input.replace(new RegExp(regex3, 'g'), `[image-src]="'`);
        input = input.replace(new RegExp('.jpg"', 'g'), `.jpg'"`);
        input = input.replace(new RegExp('.JPG"', 'g'), `.JPG'"`);
        input = input.replace(new RegExp('.png"', 'g'), `.png'"`);

        return input;
    }

    navigateToContent(data) {
        var file = new NewItemEntity();
        file.domainPath = data.domainPath ? data.domainPath : data.lmtIdPath;
        file.hasChildren = "false";
        this._dataStoreService.setSessionStorageItem("selectedNewItem", file);
        file["extDpath"] = file.domainPath; file["isSubTopic"] = ""; file["contentZone"] = 32;
        this.GetContentType(file).subscribe(content => {
            switch (content.contentPageType) {
                case PgConstants.constants.ContentPageType.Content:
                    this.setUrlFromDomainId(data);
                    break;
                case PgConstants.constants.ContentPageType.PractiseArea:
                    this.setUrlFromDomainId(data);
                    break;
                case PgConstants.constants.ContentPageType.SubTopic:
                    var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
                    var selectedPracticeArea = practiceAreas.find(nI => file.domainPath.includes(nI.domainPath));
                    this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
                    var topic = selectedPracticeArea.subTocItem.find(nI => file.domainPath.includes(nI.domainId));
                    var subtopic = topic.subTocItem.find(nI => file.domainPath.includes(nI.domainId));
                    var input = { "subTopicDomainPath": subtopic.domainPath, "title": selectedPracticeArea.title + " > " + subtopic.title, "practiceArea": subtopic.title, rootArea: selectedPracticeArea.title, "subTopic": subtopic };
                    if (data.redirectedFrom) {
                        subtopic.redirectedFrom = data.redirectedFrom;
                    }
                    this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
                    break;
                case PgConstants.constants.ContentPageType.Topic:
                    this.setUrlFromDomainId(data);
                    break;
                default:
                    this.setUrlFromDomainId(data);
                    break;
            }
        });
    }

    private setUrlFromDomainId(data): void {
        var domainId = data.domainPath ? data.domainPath : data.lmtIdPath;
        let isPgSubPracticeAreaItem = this.isPgSubPracticeAreaItem((data.name ? data.name : data.lmtTitlePath), domainId);

        if (this.isPgDomainPath(domainId) || isPgSubPracticeAreaItem) {

            var paTitle = data["lmtTitlePath"] ? (data["lmtTitlePath"].indexOf("|") == -1 ? data.lmtTitlePath : data.practiceArea) : undefined;

            var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
            var selectedPracticeArea;

            if (paTitle == undefined) {
                selectedPracticeArea = practiceAreas.find(nI => domainId.split('/')[2] == nI.domainId);
            } else {
                selectedPracticeArea = practiceAreas.find(nI => paTitle == nI.title);
            }


            if (!selectedPracticeArea)
                selectedPracticeArea = practiceAreas.find(nI => data.domainPath.includes(nI.domainPath))
            this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);

            if (domainId.split('/').length === 5) {
                let topic = selectedPracticeArea.subTocItem.find(nI => domainId.split('/')[domainId.split('/').length - 2] == nI.domainId);
                let subtopic = topic.subTocItem.find(nI => domainId.split('/')[domainId.split('/').length - 1] == nI.domainId);

                let input = {
                    "subTopicDomainPath": subtopic.domainPath,
                    "title": selectedPracticeArea.title + " > " + subtopic.title,
                    "practiceArea": subtopic.title,
                    "rootArea": selectedPracticeArea.title,
                    "subTopic": subtopic
                };
                this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
            } else if ((domainId.split('/').length > 5)) {
                if (domainId.indexOf('isMultiView') > -1) {
                    var inputNote = { "title": null, "domainPath": domainId.split('|')[0] };
                    this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(inputNote));
                }
                else {
                    let topic = selectedPracticeArea.subTocItem.find(nI => domainId.includes(nI.domainId));
                    let subtopic = topic.subTocItem.find(nI => domainId.includes(nI.domainId));
                    let domainPathLength = domainId.split('/').length;
                    let parentDomainId = topic.domainId;

                    this.getEssential();
                    var guidancedetail = {
                        "domainPath": domainId,
                        "domainId": domainId.split('/')[domainPathLength - 1],
                        "parentDomainId": parentDomainId,
                        "title": data.name ? data.name : (data['lmtTitlePath'] ? ((data.lmtTitlePath.split("Guidance|")[1]).split("|")[0]) : (data.title ? data.title : "Content")),
                        "practiceArea": selectedPracticeArea.title,
                        "topic": topic.title,
                        "subtopic": subtopic,
                        "essentials": this.essentials
                    };
                    if (data.title != undefined && data.title.includes("<span class='SearchHIT'>")) {
                        guidancedetail['fromSearch'] = true;
                        guidancedetail['jumpString'] = data.title.replace(/<span class='SearchHIT'>/g, '').replace(/<\/span>/g, '');
                    }
                    if (data.lmtTitlePath) {
                        guidancedetail.topic = subtopic.title;
                    }
                    if (selectedPracticeArea.domainId == 'b2ioc' || selectedPracticeArea.domainId == 'nor6d') {
                        subtopic = subtopic.subTocItem.find(nI => domainId.split('/')[5] == nI.domainId);

                        let input = {
                            "subTopicDomainPath": subtopic.domainPath,
                            "title": selectedPracticeArea.title + " > " + subtopic.title,
                            "practiceArea": subtopic.title,
                            "rootArea": selectedPracticeArea.title,
                            "subTopic": subtopic
                        };

                        this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
                    } else {
                        this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidancedetail));
                    }
                }

            }

            else {
                this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
            }

        }
        else {
            this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
            this._dataStoreService.setSessionStorageItem("selectedNewItem", data);
            this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
        }
    }

    getEssential() {

        let subTopics = [];
        let selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");

        let paName = selectedPracticeArea.title;
        if (selectedPracticeArea.type == "PA-MD") {
            paName = selectedPracticeArea.actualTitle;
        }

        this._essentialService.getEssentialsCount({ practiceAreaName: paName }).subscribe(allFilters => {
            let aggrFilters = this._essentialService.aggregateEssentials(allFilters);
            let topics;
            let documentType;

            if (aggrFilters.topics != undefined) {
                topics = Object.keys(aggrFilters.topics).map(topic => {
                    return { title: topic, isSelected: true, count: aggrFilters.topics[topic]['total'], topic: topic, isTopic: true, topicData: aggrFilters.topics[topic] };
                });
            }

            if (aggrFilters.documentTypes != undefined) {
                documentType = Object.keys(aggrFilters.documentTypes).map(docTitle => {
                    return { title: docTitle, isSelected: true, count: aggrFilters.documentTypes[docTitle], isTopic: false, topic: docTitle };
                });
            }

            this._essentialService.getAllEssentialsByPage({ topics: topics.concat(documentType), page: 1, size: 5, practiceAreaName: paName }).subscribe((essentials) => {
                if (essentials && essentials.length > 0) {
                    if (essentials[0].isValid) {
                        this.essentials = essentials;
                    } else {
                        this.essentials = [];
                    }
                } else {
                    this.essentials = [];
                }

            });
        });


    }




    isPgDomainPath(domainPath: string) {
        return (domainPath.indexOf('a2ioc') > -1 ? true : false);
    }

    isPgModule(domainPath: string) {
        return (domainPath.indexOf('b2ioc') > -1 || domainPath.indexOf('nor6d') > -1 ? true : false);
    }

    isPgSubPracticeAreaItem(lmtTitlePath: string, domainPath: string) {
        let isPracAreaSubItem = false;

        if (lmtTitlePath != null && lmtTitlePath != 'undefined') {
            let lmtTitlePathArray = lmtTitlePath.split('|');

            let indexLen = 3;
            let topicLoc = 2;
            if (this.isPgModule(domainPath)) {
                indexLen++;
                topicLoc++;
            }

            //e.g. PGS|Civil Procedure|Introduction|Civil Procedure Introduction
            if (lmtTitlePathArray.length >= indexLen &&
                (
                    lmtTitlePathArray[topicLoc].toLowerCase() === 'introduction'
                    || lmtTitlePathArray[topicLoc].toLowerCase() === 'latest updates'
                    || lmtTitlePathArray[topicLoc].toLowerCase() === 'news'
                ))
                isPracAreaSubItem = true;
        }

        return (isPracAreaSubItem);
    }

    public GetContent(input): Observable<any> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.GetContent, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    public GetPermaLink(input): Observable<any> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.GetPermaLink, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }


    public GetPermaLinkData(input): Observable<any> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.GetPermaLinkData, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    public GetContentType(input): Observable<ContentInfo> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.GetContentType, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }


    public GetPermaLinkViewData(input): Observable<DownloadContentInfo> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.GetPermalinkContentViewData, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }


    public HasAccessToContent(input): Observable<DownloadContentInfo> {
        return this.http.post(PgConstants.constants.WEBAPIURLS.HasAccessToContent, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }



    showContentByDomainPath(dpath, fromLib, data) {

        if (this.isPgDomainPath(dpath)) {
            let paDomainId = dpath.split('/')[2];
            let practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
            let selectedPracticeArea = practiceAreas.find(nI => paDomainId == nI.domainId);
            this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
            let topic = selectedPracticeArea.subTocItem ? selectedPracticeArea.subTocItem.find(nI => dpath.split('/')[3] == nI.domainId) : {};
            let subtopic = topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId);

            if (this.isPgModule(dpath)) {
                let paModule = selectedPracticeArea.subTocItem ? selectedPracticeArea.subTocItem.find(nI => dpath.split('/')[3] == nI.domainId) : {};
                topic = paModule.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId);
                subtopic = topic.subTocItem.find(nI => dpath.split('/')[5] == nI.domainId);

            }
            let domainPathLength = dpath.split('/').length;
            let guidancedetail = {
                "domainPath": dpath,
                "domainId": dpath.split('/')[domainPathLength - 1],
                "parentDomainId": dpath.split('/')[domainPathLength - 2],
                "title": data.title,
                "practiceArea": selectedPracticeArea.title,
                "topic": subtopic.title,
                "subtopic": subtopic,
                "essentials": [],
                "hasChildren": true,
                "fromLib": fromLib == 'yes' ? true : false

            };
            let inputdata = {
                "practiceArea": subtopic.title,
                "rootArea": selectedPracticeArea.title,
                "subTopic": subtopic,
                "subTopicDomainPath": subtopic.domainPath,
                "title": selectedPracticeArea.title + " > " + subtopic.title,
            }
            if (domainPathLength == 6 || domainPathLength == 8) {
                if (this.isPgModule(dpath)) {
                    let inputdata = {
                        "practiceArea": subtopic.title,
                        "rootArea": selectedPracticeArea.title,
                        "subTopic": subtopic,
                        "subTopicDomainPath": subtopic.domainPath,
                        "title": selectedPracticeArea.title + " > " + subtopic.title,
                    }
                    this.getGNdetailData(inputdata, guidancedetail);
                } else {
                    let newItem = { "domainPath": dpath, "hasChildren": false, "back": false };
                    this.navigateToContentView(newItem);
                }

            } else {
                if (this.isPgModule(dpath)) {
                    let newItem = { "domainPath": dpath, "hasChildren": false, "back": false };
                    this.navigateToContentView(newItem);
                } else {
                    this.getGNdetailData(inputdata, guidancedetail);
                }
            }

        } else {
            let newItem = { "domainPath": dpath, "hasChildren": false, "back": false };
            this.navigateToContentView(newItem);
        }

    }

    navigateToContentView(newItem) {
        this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
        this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
        this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
    }
    getGNdetailData(viewModel, guidanceDetail) {

        this._guidanceNoteService.getHomeContentForSubTopic(viewModel).subscribe(data => {
            let subTopicData = data;
            let guidances = [];
            

            guidances = subTopicData.result.guidance;
            this._dataStoreService.setSessionStorageItem("Guidances", guidances);
            if (subTopicData.result["forms & precedents"] != null) {
                this.getEssentials(subTopicData.result["forms & precedents"], "Forms & Precedents");
            }
            if (subTopicData.result["checklists"] != null) {
                this.getEssentials(subTopicData.result["checklists"], "Checklists");
            }
            if (subTopicData.result["other resources"] != null) {
                this.getEssentials(subTopicData.result["other resources"], "Other Resources");
            }
            
            guidanceDetail["guidances"] = guidances;
            guidanceDetail.essentials = this.essentials;
            guidanceDetail.redirectedFrom = "folder-detail";

            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
        }, error => {

            //this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
        });

    }
    getEssentials(essentialsList, eType) {
        if (this.essentials == null)
            this.essentials = [];
        essentialsList.forEach(e => {
            e.subContentDomains.forEach(el => {
                el.eType = eType;
                el.guidance = this.rootArea + ' > ' + this.practiceArea;
                this.essentials.push(el);

            });
        })

    }

    setModulesAsPracticeAreas(practiceAreas: TocItemViewModel[]): void {
        this.practiceAreas = [];
        practiceAreas.forEach((practiceArea: TocItemViewModel) => {
            if (practiceArea.type === 'MD') {
                let modules: TocItemViewModel[] = practiceArea.subTocItem.map((individualModule: TocItemViewModel) => {
                    individualModule.isSubscribed = practiceArea.isSubscribed;
                    if (practiceArea.title.includes('Income Tax')) {
                        individualModule.title = 'Tax' + ' - ' + individualModule.title;
                    }
                    else if (practiceArea.title.includes('Real Estate')) {
                        individualModule.title = 'Real Estate' + ' - ' + individualModule.title;
                    }
                    else {
                        individualModule.title = practiceArea.title + ' - ' + individualModule.title;
                    }
                    return individualModule;
                });
                this.practiceAreas.push(...modules);
            } else {
                this.practiceAreas.push(practiceArea);
            }
            this._dataStoreService.setSessionStorageItem("AllModulesPAs", this.practiceAreas);

        });
    }
}

