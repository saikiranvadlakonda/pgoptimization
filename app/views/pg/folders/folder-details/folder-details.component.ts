import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FoldersService } from '../../../../shared/services/folders/folders.service'
import { SubscriberClientViewModel } from '../../../../shared/models/Repository/subscriberClient.model';
import { FolderInfoViewModel, FolderFileInfoViewModel } from '../../../../shared/models/Repository/folderInfo.model';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';

@Component({
    selector: 'folder-details',
    templateUrl: './folder-details.component.html',
    styleUrls: ['./folder-details.component.css']
})
export class FolderDetailsComponent implements OnInit {
    TotalFolderCount: number = 0; ChildTotalFolderCount: number = 0; FileTotalFolderCount: number = 0;
    myExpression: boolean = false;
    ParentFolders: boolean; FolderFileView: boolean = false;
    folderContentListInfo: FolderFileInfoViewModel = new FolderFileInfoViewModel();
    FileTotalFolderLength: number = 0; Parentfoldername: string; FolderFileListbackup: FolderFileInfoViewModel = new FolderFileInfoViewModel();
    subscriberClientID: number; CreateFolder: CreateFolerViewModel = new CreateFolerViewModel(); Createfoldertxt: string;
    modalRef: BsModalRef;
    @ViewChild('modalContent') modalContent: TemplateRef<any>
    constructor(private _foldersService: FoldersService, private _routerProxy: RouterProxy,
        private _navigationService: NavigationService, private modalService: BsModalService,
        private _dataStoreService: DataStoreService) { }

    folderDetails;
    files;
    file: NewItemEntity;

    ngOnInit() {

        this.folderDetails = this._dataStoreService.getSessionStorageItem("FolderDetails");
        this.files = [];
        this.Parentfoldername = this.folderDetails.clientDescription;
        this.getFiles(this.folderDetails.parentFolders);

    }

    getFile(subscriberClientID) {
        this._foldersService.getFile(subscriberClientID).subscribe(data => {
            if (data.folderContentList.length > 0) {
                this.FolderFileListbackup.folderContentList = this.folderContentListInfo.folderContentList = data.folderContentList;
                // this.FolderFileListbackup.folderContentList = this.folderContentListInfo.folderContentList = this.folderContentListInfo.folderContentList.filter(book => book.subscriberClientID == viewModel.subscriberClientID);
                this.FileTotalFolderLength = this.folderContentListInfo.folderContentList.length;
                //this.Parentfoldername = viewModel.clientDescription;
            }
            else this.FolderFileView = true;
        });
    }

    filterFolder = function (FilterFoldertext, event) {
        if (event.keyCode == 8 || event.keyCoe == 46) {
            this.folderContentListInfo.folderContentList = this.FolderFileListbackup.folderContentList.filter(ele => {
                return ele.clientDescription.toLowerCase().includes(FilterFoldertext.toLowerCase());
            })
        }
        else if (event.keyCode != 8) {
            FilterFoldertext.trim() != '' ?
                this.folderContentListInfo.folderContentList = this.folderContentListInfo.folderContentList.filter(ele => {
                    return ele.title.toLowerCase().includes(FilterFoldertext.toLowerCase());
                }) : this.FolderFileList.folderContentList = this.FolderFileListbackup.folderContentList;
        }
    }


    updateCreatFolder(txtcreatefolder) {
        if (txtcreatefolder != "") {
            this.CreateFolder.Createfolder = txtcreatefolder;
            this.CreateFolder.clientID = this.subscriberClientID;
            this._foldersService.UpdateFolder(this.CreateFolder).subscribe(data => {
                this.modalRef.hide()
            });
        }
    }
    Folders() {
        this._navigationService.navigate(PgConstants.constants.URLS.Folders.MyFolders);
    }

    DeleteFile() {
        var FolderContentID = 0;

        if (FolderContentID != 0) {
            this._foldersService.DeleteFolderFile(FolderContentID).subscribe(data => {
                this.getFile(this.subscriberClientID);
            });
        }
    }

    openModal(template: TemplateRef<any>) {

        this.modalRef = this.modalService.show(template);
    }


    getFiles(folders) {

        folders.forEach(f => {
            if (f.desc)
                f.desc = f.desc;
            else
                f.desc = f.folderName;
            if (f.files) {
                f.files.forEach(fl => {
                    fl.desc = f.desc;
                    this.files.push(fl);
                });
            }

            if (f.folders) {
                f.folders.forEach(sf => {
                    if (sf.desc)
                        sf.desc = sf.desc + ' > ' + f.desc + ' > ' + sf.folderName;
                    else
                        sf.desc = f.desc + ' > ' + sf.folderName;

                    if (sf.files) {
                        sf.files.forEach(fl => {
                            fl.desc = sf.desc;
                            this.files.push(fl);
                        });
                    }

                    if (sf.folders) {
                        sf.folders.forEach(sbf => {
                            sbf.desc = sf.desc;
                        });
                        this.getFiles(sf.folders);
                    }
                });
            }
        });
    }

    navigateToContent(url) {
        var file = new NewItemEntity();
        file.domainPath = url;
        file.hasChildren = "false";
        this._dataStoreService.setSessionStorageItem("selectedNewItem", file);
        this.setUrlFromDomainId(url);
    }

    private setUrlFromDomainId(domainId: string): void {
        if (this.isPgDomainPath(domainId)) {
            let isPgSubPracticeAreaItem = this.isPgSubPracticeAreaItem("", domainId);
            if (domainId.split('/').length === 5) {
                var input = { "subTopicDomainPath": domainId, "title": null, "practiceArea": null, rootArea: null };
                this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
            }




            else if ((domainId.split('/').length > 5)) {
                if (domainId.indexOf('isMultiView') > -1) {
                    var inputNote = { "title": null, "domainPath": domainId.split('|')[0] };
                    this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(inputNote));
                }
                else {
                    var inputNotedet = { "title": null, "domainPath": domainId };
                    this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(inputNotedet));
                }

            }

            else {
                this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
            }

        }
        else { this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView); }
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
}
