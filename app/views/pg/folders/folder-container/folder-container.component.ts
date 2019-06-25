import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { FolderParentComponent } from '../folder-parent/folder-parent.component';
import { FolderDetailComponent } from '../folder-detail/folder-detail.component';


@Component({
  selector: 'pg-folder-container',
  templateUrl: './folder-container.component.html',
  styleUrls: ['./folder-container.component.scss']
})
export class FolderContainerComponent implements OnInit {

  constructor(private _foldersService: FoldersService) { }

  folderInfo;
  clientFolder;
  parentFolder;
  folderDetails;
  selectedFolder;
  currentSelection: string = 'ClientList';
  breadCrumb: string = '';
  selectedFolders = [];
  CreateFolder: CreateFolerViewModel = new CreateFolerViewModel();
  searchedFolder;
  @Input() isSaveToFolder: boolean;
  @Input() saveToFolderContent: any = {
      title: ""
  };
  @Output() selectedSaveToFolder: EventEmitter<any> = new EventEmitter<any>();
  @Output() popUpClose: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(FolderParentComponent) folderParentComponent: FolderParentComponent;
  @ViewChild(FolderDetailComponent) folderDetailComponent: FolderDetailComponent;

  newFolder = {
        "folderNameID": null,
        "folderName": null,
        "parentFolderID": null,
        "subscriberClientID": null,
        "subscriberID": null,
        "dateCreated": null,
        "lastAccessedDate": null,
        "isVisible": null,
        "isValid": null,
        "isNewFolder": true,
        "isEnableEdit": null,
        "folders": [],
        "files": []
    }
	
  ngOnInit() {
    this.getAllFolders();
  }

  onClientFolderClick(folder) {
    // this.clientFolder = folder;
    // this.breadCrumb = this.clientFolder.clientDescription;
    // this.currentSelection = 'parentFolder';
	this._foldersService.getSelectedFoldersFiles(folder.subscriberClientId).subscribe(data => {
            folder['folders'] = data.foldersList;
            folder['files'] = data.filesList;
            this.clientFolder = folder;
            this.breadCrumb = this.clientFolder.clientDescription;
            this.currentSelection = 'parentFolder';
        });
  }

  onParentFolderSelect(parentFolder) {
    // if (this.currentSelection == 'parentFolder')
      // this.parentFolder = parentFolder;
    // this.folderDetails = parentFolder;
    // this.currentSelection = 'folderDetails';
    // this.breadCrumb = this.breadCrumb + ' > ' + this.folderDetails.folderName;
    // this.selectedFolders.push(this.folderDetails);
	
        //if (this.currentSelection == 'parentFolder')
            this.parentFolder = parentFolder;
        this._foldersService.getSelectedFoldersFiles(parentFolder.folderNameID).subscribe(data => {
            parentFolder['folders'] = JSON.parse(JSON.stringify(data.foldersList));
            parentFolder['files'] = JSON.parse(JSON.stringify(data.filesList));
            //data['folderName'] = data.folderName;
            this.folderDetails = parentFolder;
            this.folderDetails['folderName'] = parentFolder.folderName;
            //this.folderDetails = parentFolder;
            this.currentSelection = 'folderDetails';
            this.breadCrumb = this.breadCrumb + ' > ' + this.folderDetails.folderName;
            this.selectedFolders.push(this.folderDetails);
        });
  }

  onParentFolderBackClick() {
    this.currentSelection = 'ClientList';
    this.breadCrumb = '';
	this.getAllFolders();
  }

  onFolderBackClick(val) {
    // if (val == 'true') {
      // this.currentSelection = 'parentFolder';
      // this.breadCrumb = this.clientFolder.clientDescription;
      // this.selectedFolders = [];
    // }
    // else {
      // this.setFoldersBreadCrumb();
    // }
	if (val == 'true') {
		this._foldersService.getSelectedFoldersFiles(this.clientFolder.subscriberClientId).subscribe(data => {
			this.clientFolder.files = data.filesList;
			this.clientFolder.folders = data.foldersList;
			this.currentSelection = 'parentFolder';
			this.breadCrumb = this.clientFolder.clientDescription;
			this.selectedFolders = [];
		});
		
	}
	else {
		this.setFoldersBreadCrumb();
	}
  }

  onFolderClick(folder) {
    // this.selectedFolders.push(folder);
    // this.folderDetails = JSON.parse(JSON.stringify(folder));
    // this.selectedFolder = folder;
    // this.setFoldersBreadCrumb();
	this._foldersService.getSelectedFoldersFiles(folder.folderNameID).subscribe(data => {
		folder['folders'] = JSON.parse(JSON.stringify(data.foldersList));
		folder['files'] = JSON.parse(JSON.stringify(data.filesList));
		//folder['folderName'] = folder.folderName;


		this.selectedFolders.push(folder);
		this.folderDetails = JSON.parse(JSON.stringify(folder));
		this.selectedFolder = folder;
		this.setFoldersBreadCrumb();
	});
  }

  setFoldersBreadCrumb() {
    var folderBreadCrumb = '';
    this.selectedFolders.forEach(f => {
      folderBreadCrumb = (folderBreadCrumb == '') ? f.folderName : folderBreadCrumb + ' > ' + f.folderName;
    });
    this.breadCrumb = this.clientFolder.clientDescription + ' > ' + folderBreadCrumb;
  }

  onNewClientAdd(folder) {
    this.CreateFolder = new CreateFolerViewModel();
    this.CreateFolder.Createfolder = folder.clientDescription;
    this._foldersService.CreateClient(this.CreateFolder).subscribe(data => {
      this.getAllFolders();
    });
  }

  onNewParentAdd(parentFolder) {
    var createFolder = new CreateFolerViewModel();
    createFolder.clientID = parentFolder.subscriberClientID;
    createFolder.folderName = parentFolder.folderName;
    createFolder.parentFolderID = null;
    // this._foldersService.CreateFolder(createFolder).subscribe(data => {
      // this.getAllFolders();
    // });
	this._foldersService.CreateFolder(createFolder).subscribe(data => {
		this._foldersService.getSelectedFoldersFiles(this.clientFolder.subscriberClientId).subscribe(data => {
			this.clientFolder.files = data.filesList;
			this.clientFolder.folders = data.foldersList;
			this.folderParentComponent.clientFolder = this.clientFolder;
			this.folderParentComponent.getFolders();
			this.currentSelection = "parentFolder";
			//this.getAllFolders(parentFolder);
		});
	});
  }

  onNewFolderAdd(folder) {
    var createFolder = new CreateFolerViewModel();
    createFolder.clientID = this.clientFolder.subscriberClientId;
    createFolder.folderName = folder.folderName;
    createFolder.parentFolderID = folder.parentFolderID;
    // this._foldersService.CreateFolder(createFolder).subscribe(data => {
      // this.getAllFolders(folder);
    // });
	if (folder.parentFolderID == undefined || folder.parentFolderID == null) {
		createFolder.parentFolderID = this.parentFolder.folderNameID;
	}
	this._foldersService.CreateFolder(createFolder).subscribe(data => {
		this._foldersService.getSelectedFoldersFiles(createFolder.parentFolderID).subscribe(data => {
			var folderData = {};
			Object.keys(this.folderDetails).forEach(key => {
				folderData[key] = this.folderDetails[key];
			});
			folderData['folders'] = JSON.parse(JSON.stringify(data.foldersList));
			folderData['files'] = JSON.parse(JSON.stringify(data.filesList));
			//this.folderDetails['folderName'] = this.parentFolder.folderName;
			this.folderDetails = folderData;
			//this.getAllFolders(folder);
		});

	});

  }

  getAllFolders(folder = null) {
    //this._foldersService.getFolders().subscribe(data => {
        //    this.folderInfo = data;
        //    if (this.clientFolder)
        //        this.setCurrentClientFolder();
        //    if (folder)
        //        this.searchSelectedFolder(folder);
        //});
        this._foldersService.getRootFolders().subscribe(data => {
            this.folderInfo = data;
            //if (this.clientFolder)
            //    this.setCurrentClientFolder();
            //if (folder)
            //    this.searchSelectedFolder(folder);
        });
  }

  setCurrentClientFolder() {
    this.clientFolder = this.folderInfo.find(c => c.subscriberClientId == this.clientFolder.subscriberClientId);
  }

  searchSelectedFolder(folder) {
    // var parentFolder = this.clientFolder.parentFolders.find(p => p.folderNameID == this.parentFolder.folderNameID);
    // if (parentFolder.folderNameID == folder.parentFolderID || parentFolder.folderNameID == folder.folderNameID)
      // this.folderDetails = JSON.parse(JSON.stringify(parentFolder));
    // else
      // this.searchFolders(parentFolder, folder.parentFolderID);
	var parentFolder;
	if (this.clientFolder && this.clientFolder.parentFolders)
		parentFolder = this.clientFolder.parentFolders.find(p => p.folderNameID == this.parentFolder.folderNameID);
	if (parentFolder && (parentFolder.folderNameID == folder.parentFolderID || parentFolder.folderNameID == folder.folderNameID))
		this.folderDetails = JSON.parse(JSON.stringify(parentFolder));
	else if (parentFolder)
		this.searchFolders(parentFolder, folder.parentFolderID);
	else {
		this.searchFolders(this.selectedFolders[0], folder.folderName);
	}
  }

  searchFolders(parentFolder, folderId) {
    // var folder = parentFolder.folders.find(f => f.folderNameID == folderId);
    // if (folder) {
      // this.folderDetails = folder;
      // return;
    // }

    // parentFolder.folders.forEach(f => {
      // this.searchFolders(f, folderId);
    // });
	if (parentFolder && parentFolder.folderName == folderId) {
            this._foldersService.getSelectedFoldersFiles(parentFolder.folderNameID).subscribe(data => {
                parentFolder['folders'] = JSON.parse(JSON.stringify(data.foldersList));
                parentFolder['files'] = JSON.parse(JSON.stringify(data.filesList));
                parentFolder['folderName'] = parentFolder.folderName;
                this.folderDetails = parentFolder;
            });
            return;
        }

        var folder = parentFolder.folders.find(f => f.folderNameID == folderId);
        if (folder) {
            this.folderDetails = folder;
            return;
        }

        parentFolder.folders.forEach(f => {
            this.searchFolders(f, folderId);
        });
  }

  onClientFolderEdit(client) {
    var createFolder = new CreateFolerViewModel();
    createFolder.subscriberClientId = client.subscriberClientId;
    createFolder.clientDescription = client.clientDescription;
    this._foldersService.UpdateClient(createFolder).subscribe(data => {
      this.getAllFolders();
	this._foldersService.getSelectedFoldersFiles(client.subscriberClientId).subscribe(data => {

	});
    });
  }

  onClientFolderDelete(client) {
    var createFolder = new CreateFolerViewModel();
    createFolder.clientID = client.subscriberClientId;
    this._foldersService.DeleteClient(createFolder).subscribe(data => {
      this.getAllFolders();
    });
  }

  onEditFolder(folderContent) {
    var createFolder = new CreateFolerViewModel();
    createFolder.folderID = folderContent.editFolder.folderNameID;
    createFolder.folderName = folderContent.editFolder.folderName;
    this._foldersService.UpdateFolder(createFolder).subscribe(data => {
      if (this.currentSelection == "parentFolder") {
			this._foldersService.getSelectedFoldersFiles(this.clientFolder.subscriberClientId).subscribe(data => {
				//data['folders'] = JSON.parse(JSON.stringify(data.foldersList));
				//data['files'] = JSON.parse(JSON.stringify(data.filesList));
				//data['folderName'] = folderContent.editFolder.folderName;

				this.clientFolder.files = data.filesList;
				this.clientFolder.folders = data.foldersList;
				this.folderParentComponent.clientFolder = this.clientFolder;
				this.folderParentComponent.getFolders();

				//if (this.currentSelection == "parentFolder") {
				//    this.clientFolder['files'] = data['files'];
				//    this.clientFolder['folders'] = data['folders'];
				//} else if (this.currentSelection == "folderDetails") {
				//}

				//this.getAllFolders(folderContent.parentFolder);
			});
		} else if (this.currentSelection == "folderDetails") {
			this._foldersService.getSelectedFoldersFiles(this.folderDetails.folderNameID).subscribe(data => {
				this.folderDetailComponent.folderData.files = data.filesList;
				this.folderDetailComponent.folderData.folders = data.foldersList;
				this.folderDetails.files = data.filesList;
				this.folderDetails.folders = data.foldersList;
				this.folderDetailComponent.getFiles();
				this.folderDetailComponent.getFolders();

			});
		}
    });
  }

  onFolderDelete(deleteContent) {
    this._foldersService.DeleteFolder(deleteContent.deletedId).subscribe(data => {
      if (this.currentSelection == "parentFolder") {
			this._foldersService.getSelectedFoldersFiles(this.clientFolder.subscriberClientId).subscribe(data => {
				this.clientFolder.files = data.filesList;
				this.clientFolder.folders = data.foldersList;
				this.folderParentComponent.clientFolder = this.clientFolder;
				this.folderParentComponent.getFolders();
			});
		} else if (this.currentSelection == "folderDetails") {
			this._foldersService.getSelectedFoldersFiles(this.folderDetails.folderNameID).subscribe(data => {
				data['folders'] = JSON.parse(JSON.stringify(data.foldersList));
				data['files'] = JSON.parse(JSON.stringify(data.filesList));
			   // data['folderName'] = deleteContent.parentFolder.folderName;
				//data['parentFolderID'] = deleteContent.parentFolder.parentFolderID;
				this.folderDetails.files = data.files;
				this.folderDetails.folders = data.folders;
				this.folderDetailComponent.folderData.files = data.filesList;
				this.folderDetailComponent.folderData.folders = data.foldersList;
				this.folderDetailComponent.getFiles();
				this.folderDetailComponent.getFolders();
				//this.getAllFolders(deleteContent.parentFolder);
			});
		}
    });
  }

  onSaveToFolder(folder) {
    var createFolder = new CreateFolerViewModel();
    createFolder.subscriberClientId = folder.subscriberClientID;
    createFolder.folderID = folder.folderNameID;
    createFolder.url = this.saveToFolderContent.url;
    createFolder.title = this.saveToFolderContent.title;
    if (this.saveToFolderContent.searchResult && this.saveToFolderContent.searchResult.length > 0) {
      this.saveToFolderContent.searchResult.forEach(r => {
        createFolder.subscriberClientId = folder.subscriberClientID;
        createFolder.folderID = folder.folderNameID;
        createFolder.url = r.lmtIDPath;
        r.title = r.title.replace(new RegExp(`<span class='SearchHIT'>`, 'g'), "");
        r.title = r.title.replace(new RegExp(`</span>`, 'g'), "");
        createFolder.title = r.title;
        this._foldersService.CreateDocument(createFolder).subscribe(data => {
          this.popUpCloseClick();
        });
      });
    }
    else if (this.saveToFolderContent.essentialResult && this.saveToFolderContent.essentialResult.length > 0) {
      this.saveToFolderContent.essentialResult.forEach(r => {
        createFolder.subscriberClientId = folder.subscriberClientID;
        createFolder.folderID = folder.folderNameID;
        createFolder.url = r.domainPath;
          createFolder.title = r.title;
        this._foldersService.CreateDocument(createFolder).subscribe(data => {
          this.popUpCloseClick();
        });
      });
    }
    else {
      this._foldersService.CreateDocument(createFolder).subscribe(data => {
        this.popUpCloseClick();
      });
    }

  }

  onFileDelete(deleteContent) {
    this._foldersService.DeleteFolderFile(deleteContent.deletedId).subscribe(data => {
      this._foldersService.getSelectedFoldersFiles(this.folderDetailComponent.folderDetails.folderNameId).subscribe(data => {
			this.folderDetailComponent.folderDetails.files = data.files;
			this.folderDetailComponent.folderDetails.folders = data.folders;
		});
    });
  }

  popUpCloseClick() {
    this.saveToFolderContent = null;
    this.popUpClose.emit(true);
  }

  //folderInfo = [{ "subscriberClientId": 1285587, "subscriberId": 2451061, "clientDescription": "FUll reg", "dateCreated": "2018-07-18T08:35:18.11", "lastAccessedDate": "2018-07-18T08:35:18.11", "zoneId": 32, "parentFolders": [{ "folderNameID": 22375, "folderName": "PG test", "parentFolderID": null, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-07-18T08:35:39.993", "lastAccessedDate": "2018-07-18T08:35:39.993", "isVisible": true, "folders": [{ "folderNameID": 22423, "folderName": "Sub 1", "parentFolderID": 22375, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-07-20T20:43:56.79", "lastAccessedDate": "2018-07-20T20:43:56.79", "isVisible": false, "folders": [{ "folderNameID": 23163, "folderName": "Inner folder", "parentFolderID": 22423, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-01T10:51:39.863", "lastAccessedDate": "2018-09-01T10:51:39.863", "isVisible": false, "folders": [], "files": [{ "folderContentID": 97442, "folderNameID": 23163, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/gs9me/979me/a89me", "lmtid": null, "title": "Establishing compliance", "contentType": "Content", "comment": null, "commentDated": "2018-09-08T19:41:49.527", "dateAdded": "2018-09-01T10:52:16.38", "zoneID": null, "isCustomView": false }] }], "files": [] }], "files": [{ "folderContentID": 95734, "folderNameID": 22375, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/kilc/egqg/0nqg/1nqg/64bh", "lmtid": null, "title": "166.   Judicial system.—The courts are—", "contentType": "Content", "comment": null, "commentDated": "2018-07-18T08:35:41.46", "dateAdded": "2018-07-18T08:35:41.46", "zoneID": null, "isCustomView": false }, { "folderContentID": 95739, "folderNameID": 22375, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/cqsvc/oqsvc/vtc2c/5fo3c/qxo3c", "lmtid": null, "title": "Sale of a business agreement", "contentType": "Content", "comment": null, "commentDated": "2018-07-18T08:47:33.833", "dateAdded": "2018-07-18T08:47:33.833", "zoneID": null, "isCustomView": false }, { "folderContentID": 95740, "folderNameID": 22375, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/bqsvc/lqsvc/yel5c/l3k8c/8ow8c", "lmtid": null, "title": "Application for business rescue", "contentType": "Content", "comment": null, "commentDated": "2018-07-18T08:47:33.843", "dateAdded": "2018-07-18T08:47:33.843", "zoneID": null, "isCustomView": false }, { "folderContentID": 95741, "folderNameID": 22375, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/jtwjd/yuwjd/p2eye/q2eye/c3eye", "lmtid": null, "title": "Business continuity plan", "contentType": "Content", "comment": null, "commentDated": "2018-07-18T08:47:33.853", "dateAdded": "2018-07-18T08:47:33.853", "zoneID": null, "isCustomView": false }, { "folderContentID": 96168, "folderNameID": 22375, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/gs9me/979me/a89me", "lmtid": null, "title": "Establishing compliance", "contentType": "Content", "comment": null, "commentDated": "2018-09-08T20:35:41.46", "dateAdded": "2018-07-30T12:01:58.8", "zoneID": null, "isCustomView": false }, { "folderContentID": 96169, "folderNameID": 22375, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/v5e8d/wo38d/xo38d", "lmtid": null, "title": "Types of consumer rights", "contentType": "Content", "comment": null, "commentDated": "2018-07-30T12:02:46.31", "dateAdded": "2018-07-30T12:02:46.31", "zoneID": null, "isCustomView": false }, { "folderContentID": 96177, "folderNameID": 22375, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/v5e8d/wo38d/xo38d/zo38d/0o38d|isMultiView", "lmtid": null, "title": "Basis of consumer rights", "contentType": "Content", "comment": null, "commentDated": "2018-07-30T12:03:14.09", "dateAdded": "2018-07-30T12:03:14.09", "zoneID": null, "isCustomView": false }, { "folderContentID": 96238, "folderNameID": 22375, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/6aewd/z7k0d/07k0d/27k0d/37k0d|isMultiView", "lmtid": null, "title": "What is dispute resolution", "contentType": "Content", "comment": null, "commentDated": "2018-07-31T13:32:00.37", "dateAdded": "2018-07-31T13:32:00.37", "zoneID": null, "isCustomView": false }, { "folderContentID": 97599, "folderNameID": 22375, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/lewce/hcbee/icbee/kcbee/ocbee/hqvbf", "lmtid": null, "title": "Testing", "contentType": "Content", "comment": null, "commentDated": "2018-09-07T19:52:05.93", "dateAdded": "2018-09-07T19:52:05.93", "zoneID": null, "isCustomView": false }] }, { "folderNameID": 23162, "folderName": "PG test 1", "parentFolderID": null, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-01T08:19:15.2", "lastAccessedDate": "2018-09-01T08:19:15.2", "isVisible": true, "folders": [], "files": [{ "folderContentID": 97441, "folderNameID": 23162, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/gs9me/979me/a89me", "lmtid": null, "title": "Establishing compliance", "contentType": "Content", "comment": null, "commentDated": "2018-09-01T08:20:35.043", "dateAdded": "2018-09-01T08:20:35.043", "zoneID": null, "isCustomView": false }] }, { "folderNameID": 23164, "folderName": "PG test 2", "parentFolderID": null, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-01T20:51:14.833", "lastAccessedDate": "2018-09-01T20:51:14.833", "isVisible": true, "folders": [{ "folderNameID": 23166, "folderName": "pg test -sb 1", "parentFolderID": 23164, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-01T20:51:52.877", "lastAccessedDate": "2018-09-01T20:51:52.877", "isVisible": false, "folders": [{ "folderNameID": 23169, "folderName": "pg test -sb - sb 1", "parentFolderID": 23166, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-01T20:52:22.293", "lastAccessedDate": "2018-09-01T20:52:22.293", "isVisible": false, "folders": [], "files": [] }, { "folderNameID": 23170, "folderName": "pg test -sb - sb 2", "parentFolderID": 23166, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-01T20:52:29.937", "lastAccessedDate": "2018-09-01T20:52:29.937", "isVisible": false, "folders": [], "files": [] }], "files": [] }, { "folderNameID": 23167, "folderName": "pg test -sb 2", "parentFolderID": 23164, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-01T20:51:59.837", "lastAccessedDate": "2018-09-01T20:51:59.837", "isVisible": false, "folders": [], "files": [] }, { "folderNameID": 23168, "folderName": "pg test -sb 3", "parentFolderID": 23164, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-01T20:52:06.993", "lastAccessedDate": "2018-09-01T20:52:06.993", "isVisible": false, "folders": [], "files": [] }], "files": [] }, { "folderNameID": 23165, "folderName": "PG test 3", "parentFolderID": null, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-01T20:51:25.04", "lastAccessedDate": "2018-09-01T20:51:25.04", "isVisible": true, "folders": [], "files": [] }, { "folderNameID": 23272, "folderName": "PG Test 4", "parentFolderID": null, "subscriberClientID": 1285587, "subscriberID": null, "dateCreated": "2018-09-08T20:35:19.5", "lastAccessedDate": "2018-09-08T20:35:19.5", "isVisible": true, "folders": [], "files": [] }] }, { "subscriberClientId": 1968438, "subscriberId": 2451061, "clientDescription": "Gordan", "dateCreated": "2018-08-17T11:11:29.32", "lastAccessedDate": "2018-08-17T11:11:29.32", "zoneId": 32, "parentFolders": [{ "folderNameID": 22900, "folderName": "abvnf", "parentFolderID": null, "subscriberClientID": 1968438, "subscriberID": null, "dateCreated": "2018-08-17T11:12:43.953", "lastAccessedDate": "2018-08-17T11:12:43.953", "isVisible": true, "folders": [], "files": [{ "folderContentID": 96807, "folderNameID": 22900, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/hdltc/07r1c/37r1c/3cs1c/6cs1c|isMultiView", "lmtid": null, "title": "Specific offences", "contentType": "Content", "comment": null, "commentDated": "2018-08-17T11:12:55.08", "dateAdded": "2018-08-17T11:12:55.08", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1212108, "subscriberId": 2451061, "clientDescription": "Live 09/03", "dateCreated": "2017-03-09T17:53:30.95", "lastAccessedDate": "2017-03-09T17:53:30.95", "zoneId": 32, "parentFolders": [{ "folderNameID": 16915, "folderName": "test", "parentFolderID": null, "subscriberClientID": 1212108, "subscriberID": null, "dateCreated": "2017-03-09T17:53:38.01", "lastAccessedDate": "2017-03-09T17:53:38.01", "isVisible": true, "folders": [], "files": [{ "folderContentID": 85258, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": null, "lmtid": null, "title": "(Content Changed)", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.79", "dateAdded": "2017-03-09T17:53:42.79", "zoneID": null, "isCustomView": false }, { "folderContentID": 85259, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/lewce/lvfee/7vfee/w0uee/i9kge/b9vbf", "lmtid": null, "title": "Exemptions ", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.803", "dateAdded": "2017-03-09T17:53:42.803", "zoneID": null, "isCustomView": false }, { "folderContentID": 85260, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/b2ioc/75cwc/zlr1c/1lr1c/vnr1c/znr1c/vi8kf", "lmtid": null, "title": "Exemptions", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.813", "dateAdded": "2017-03-09T17:53:42.813", "zoneID": null, "isCustomView": false }, { "folderContentID": 85261, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/b2ioc/45cwc/s6o3c/x6o3c/idp3c/oxrod/9a8kf", "lmtid": null, "title": "The exemption", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.827", "dateAdded": "2017-03-09T17:53:42.827", "zoneID": null, "isCustomView": false }, { "folderContentID": 85262, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": null, "lmtid": null, "title": "(Content Changed)", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.84", "dateAdded": "2017-03-09T17:53:42.84", "zoneID": null, "isCustomView": false }, { "folderContentID": 85263, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": null, "lmtid": null, "title": "(Content Changed)", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.853", "dateAdded": "2017-03-09T17:53:42.853", "zoneID": null, "isCustomView": false }, { "folderContentID": 85264, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/nor6d/oor6d/s146d/m246d/o246d/q246d/m0mlf", "lmtid": null, "title": "Exemptions", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.867", "dateAdded": "2017-03-09T17:53:42.867", "zoneID": null, "isCustomView": false }, { "folderContentID": 85265, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/hoq0d/cft0d/dft0d/eft0d/fuo3e/7tq3e", "lmtid": null, "title": "Exemptions", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.88", "dateAdded": "2017-03-09T17:53:42.88", "zoneID": null, "isCustomView": false }, { "folderContentID": 85266, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/b2ioc/45cwc/55o3c/65o3c/o7o3c/p7o3c", "lmtid": null, "title": "Exemption", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.893", "dateAdded": "2017-03-09T17:53:42.893", "zoneID": null, "isCustomView": false }, { "folderContentID": 85267, "folderNameID": 16915, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/b2ioc/65cwc/zgr1c/1gr1c/ejr1c/fjr1c", "lmtid": null, "title": "Exemptions", "contentType": "Content", "comment": null, "commentDated": "2017-03-09T17:53:42.91", "dateAdded": "2017-03-09T17:53:42.91", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 436618, "subscriberId": 2451061, "clientDescription": "LIVE 14/12/2015", "dateCreated": "2015-12-14T20:34:26.767", "lastAccessedDate": "2015-12-14T20:34:26.767", "zoneId": 32, "parentFolders": [{ "folderNameID": 22158, "folderName": "New Folder", "parentFolderID": null, "subscriberClientID": 436618, "subscriberID": null, "dateCreated": "2018-07-01T01:26:41.75", "lastAccessedDate": "2018-07-01T01:26:41.75", "isVisible": true, "folders": [], "files": [] }, { "folderNameID": 22226, "folderName": "new test", "parentFolderID": null, "subscriberClientID": 436618, "subscriberID": null, "dateCreated": "2018-07-04T15:18:03.58", "lastAccessedDate": "2018-07-04T15:18:03.58", "isVisible": true, "folders": [{ "folderNameID": 22228, "folderName": "sub-folder", "parentFolderID": 22226, "subscriberClientID": 436618, "subscriberID": null, "dateCreated": "2018-07-04T15:22:52.55", "lastAccessedDate": "2018-07-04T15:22:52.55", "isVisible": false, "folders": [], "files": [{ "folderContentID": 95490, "folderNameID": 22228, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/5hand/fm1qd/lm1qd/nm1qd/x3cud", "lmtid": null, "title": "How to complete an immigration assessment", "contentType": "Content", "comment": null, "commentDated": "2018-07-04T15:23:19.35", "dateAdded": "2018-07-04T15:23:19.35", "zoneID": null, "isCustomView": false }] }], "files": [{ "folderContentID": 95489, "folderNameID": 22226, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/5hand/fm1qd/lm1qd/nm1qd/x3cud", "lmtid": null, "title": "How to complete an immigration assessment", "contentType": "Content", "comment": null, "commentDated": "2018-07-04T15:18:15.18", "dateAdded": "2018-07-04T15:18:15.18", "zoneID": null, "isCustomView": false }] }, { "folderNameID": 12383, "folderName": "PG Test", "parentFolderID": null, "subscriberClientID": 436618, "subscriberID": null, "dateCreated": "2015-12-14T20:33:50.897", "lastAccessedDate": "2015-12-14T20:33:50.897", "isVisible": true, "folders": [], "files": [{ "folderContentID": 74303, "folderNameID": 12383, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/4w11c/izp3c/nzp3c/31p3c/41p3c/6q83e|isMultiView", "lmtid": null, "title": "Forming a valid trust ", "contentType": "Content", "comment": null, "commentDated": "2015-12-14T20:34:47.863", "dateAdded": "2015-12-14T20:34:47.863", "zoneID": null, "isCustomView": false }, { "folderContentID": 74304, "folderNameID": 12383, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/kilc/egqg/30oib/c9uxc/k9uxc", "lmtid": null, "title": "8.   Categories of companies.—(1)  Two types of companies may be formed and incorporated under this Act, namely profit companies and non-profit companies.", "contentType": "Content", "comment": null, "commentDated": "2015-12-14T20:35:00.363", "dateAdded": "2015-12-14T20:35:00.363", "zoneID": null, "isCustomView": false }, { "folderContentID": 78760, "folderNameID": 12383, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/g51t/3iuaa/6iuaa", "lmtid": null, "title": "4.3 The international boundaries of the South African Act", "contentType": "Content", "comment": null, "commentDated": "2016-07-01T18:30:43.343", "dateAdded": "2016-07-01T18:30:43.343", "zoneID": null, "isCustomView": false }] }, { "folderNameID": 22229, "folderName": "test 2", "parentFolderID": null, "subscriberClientID": 436618, "subscriberID": null, "dateCreated": "2018-07-04T15:24:00.013", "lastAccessedDate": "2018-07-04T15:24:00.013", "isVisible": true, "folders": [], "files": [] }] }, { "subscriberClientId": 1968797, "subscriberId": 2451061, "clientDescription": "Live testing", "dateCreated": "2018-08-30T16:59:35.227", "lastAccessedDate": "2018-08-30T16:59:35.227", "zoneId": 32, "parentFolders": [{ "folderNameID": 23139, "folderName": "PG", "parentFolderID": null, "subscriberClientID": 1968797, "subscriberID": null, "dateCreated": "2018-08-30T17:00:05.23", "lastAccessedDate": "2018-08-30T17:00:05.23", "isVisible": true, "folders": [], "files": [{ "folderContentID": 97403, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/cs93c/yem5c/zem5c/bgm5c/cgm5c|isMultiView", "lmtid": null, "title": "Simple summons and declarations", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:00:08.09", "dateAdded": "2018-08-30T17:00:08.09", "zoneID": null, "isCustomView": false }, { "folderContentID": 97404, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/bqsvc/lqsvc/yel5c/l3k8c/8ow8c", "lmtid": null, "title": "Application for business rescue", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:26.93", "dateAdded": "2018-08-30T17:02:26.93", "zoneID": null, "isCustomView": false }, { "folderContentID": 97405, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/cqsvc/oqsvc/vtc2c/5fo3c/qxo3c", "lmtid": null, "title": "Sale of a business agreement", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:27.3", "dateAdded": "2018-08-30T17:02:27.3", "zoneID": null, "isCustomView": false }, { "folderContentID": 97406, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/1syyd/2syyd/vbnzd/90i0d/maq8d", "lmtid": null, "title": "Sale of business agreement", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:27.377", "dateAdded": "2018-08-30T17:02:27.377", "zoneID": null, "isCustomView": false }, { "folderContentID": 97407, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/cqsvc/oqsvc/ntc2c/w283c/gswqe", "lmtid": null, "title": "Lease for business premises", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:27.4", "dateAdded": "2018-08-30T17:02:27.4", "zoneID": null, "isCustomView": false }, { "folderContentID": 97408, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/w756d/x756d/4756d/xy4ff/8y4ff", "lmtid": null, "title": "Application for business rescue", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:27.433", "dateAdded": "2018-08-30T17:02:27.433", "zoneID": null, "isCustomView": false }, { "folderContentID": 97409, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/zoaue/y2i1e/kaa3e/laa3e/n5t3e", "lmtid": null, "title": "Terms of business policy", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:27.46", "dateAdded": "2018-08-30T17:02:27.46", "zoneID": null, "isCustomView": false }, { "folderContentID": 97410, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/jtwjd/yuwjd/81eye/e2eye/f2eye", "lmtid": null, "title": "Business continuity plan ", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:27.52", "dateAdded": "2018-08-30T17:02:27.52", "zoneID": null, "isCustomView": false }, { "folderContentID": 97411, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/jtwjd/yuwjd/p2eye/q2eye/c3eye", "lmtid": null, "title": "Business continuity plan", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:29.26", "dateAdded": "2018-08-30T17:02:29.26", "zoneID": null, "isCustomView": false }, { "folderContentID": 97412, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/zoaue/y2i1e/caa3e/gaa3e/0ea3e", "lmtid": null, "title": "Business plan template", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:29.273", "dateAdded": "2018-08-30T17:02:29.273", "zoneID": null, "isCustomView": false }, { "folderContentID": 97413, "folderNameID": 23139, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/njmjd/bhdwe/chdwe/ehdwe/oyhwe/xbh1e", "lmtid": null, "title": "Business plans vs business cases", "contentType": "Content", "comment": null, "commentDated": "2018-08-30T17:02:29.32", "dateAdded": "2018-08-30T17:02:29.32", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1968507, "subscriberId": 2451061, "clientDescription": "Main Folder", "dateCreated": "2018-08-20T18:45:19.637", "lastAccessedDate": "2018-08-20T18:45:19.637", "zoneId": 32, "parentFolders": [{ "folderNameID": 22951, "folderName": "P1", "parentFolderID": null, "subscriberClientID": 1968507, "subscriberID": null, "dateCreated": "2018-08-20T18:47:58.003", "lastAccessedDate": "2018-08-20T18:47:58.003", "isVisible": true, "folders": [{ "folderNameID": 22953, "folderName": "SF1", "parentFolderID": 22951, "subscriberClientID": 1968507, "subscriberID": null, "dateCreated": "2018-08-20T18:49:00.583", "lastAccessedDate": "2018-08-20T18:49:00.583", "isVisible": false, "folders": [], "files": [] }, { "folderNameID": 22954, "folderName": "SF2", "parentFolderID": 22951, "subscriberClientID": 1968507, "subscriberID": null, "dateCreated": "2018-08-20T18:49:09.073", "lastAccessedDate": "2018-08-20T18:49:09.073", "isVisible": false, "folders": [{ "folderNameID": 22955, "folderName": "SSF1", "parentFolderID": 22954, "subscriberClientID": 1968507, "subscriberID": null, "dateCreated": "2018-08-20T18:49:26.49", "lastAccessedDate": "2018-08-20T18:49:26.49", "isVisible": false, "folders": [], "files": [{ "folderContentID": 96867, "folderNameID": 22955, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/gs9me/490kf/590kf/supmf/wupmf", "lmtid": null, "title": "Government’s ‘malicious compliance’ with socio-economic impact assessments", "contentType": "Content", "comment": null, "commentDated": "2018-08-20T18:49:49.56", "dateAdded": "2018-08-20T18:49:49.56", "zoneID": null, "isCustomView": false }] }], "files": [] }], "files": [{ "folderContentID": 96866, "folderNameID": 22951, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/gs9me/490kf/590kf/supmf/wupmf", "lmtid": null, "title": "Government’s ‘malicious compliance’ with socio-economic impact assessments", "contentType": "Content", "comment": null, "commentDated": "2018-08-20T18:48:43.69", "dateAdded": "2018-08-20T18:48:43.69", "zoneID": null, "isCustomView": false }] }, { "folderNameID": 22952, "folderName": "P2", "parentFolderID": null, "subscriberClientID": 1968507, "subscriberID": null, "dateCreated": "2018-08-20T18:48:04.71", "lastAccessedDate": "2018-08-20T18:48:04.71", "isVisible": true, "folders": [], "files": [] }, { "folderNameID": 23014, "folderName": "p3", "parentFolderID": null, "subscriberClientID": 1968507, "subscriberID": null, "dateCreated": "2018-08-22T14:42:28.64", "lastAccessedDate": "2018-08-22T14:42:28.64", "isVisible": true, "folders": [], "files": [{ "folderContentID": 97022, "folderNameID": 23014, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/gs9me/979me/a89me", "lmtid": null, "title": "Establishing compliance", "contentType": "Content", "comment": null, "commentDated": "2018-08-22T14:42:55.337", "dateAdded": "2018-08-22T14:42:55.337", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1968687, "subscriberId": 2451061, "clientDescription": "mulaudi", "dateCreated": "2018-08-27T10:34:55.8", "lastAccessedDate": "2018-08-27T10:34:55.8", "zoneId": 32, "parentFolders": [{ "folderNameID": 23072, "folderName": "dismissal", "parentFolderID": null, "subscriberClientID": 1968687, "subscriberID": null, "dateCreated": "2018-08-27T10:36:27.457", "lastAccessedDate": "2018-08-27T10:36:27.457", "isVisible": true, "folders": [], "files": [{ "folderContentID": 97149, "folderNameID": 23072, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/b3o7c/k2p7c/n2p7c/ldo9c/xqo4e|isMultiView", "lmtid": null, "title": "Substantive Fairness", "contentType": "Content", "comment": null, "commentDated": "2018-08-27T10:36:34.32", "dateAdded": "2018-08-27T10:36:34.32", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1211136, "subscriberId": 2451061, "clientDescription": "NC", "dateCreated": "2016-11-02T10:15:38.39", "lastAccessedDate": "2016-11-02T10:15:38.39", "zoneId": 32, "parentFolders": [{ "folderNameID": 16144, "folderName": "partnership", "parentFolderID": null, "subscriberClientID": 1211136, "subscriberID": null, "dateCreated": "2016-11-02T10:16:58.55", "lastAccessedDate": "2016-11-02T10:16:58.55", "isVisible": true, "folders": [], "files": [{ "folderContentID": 82357, "folderNameID": 16144, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/cc/u0uua/ghvua/iel6a/yfl6a/jdm6a", "lmtid": null, "title": "LINDSAY AND OTHERS v STOFBERG NO [1988] 1 All SA 200 (C)", "contentType": "Content", "comment": null, "commentDated": "2016-11-02T10:17:12.273", "dateAdded": "2016-11-02T10:17:12.273", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1211454, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2016-11-29T16:56:31.603", "lastAccessedDate": "2016-11-29T16:56:31.603", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1282319, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2018-01-21T21:02:18.27", "lastAccessedDate": "2018-01-21T21:02:18.27", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1283541, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2018-04-23T08:48:23.36", "lastAccessedDate": "2018-04-23T08:48:23.36", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1283544, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2018-04-23T12:27:55.497", "lastAccessedDate": "2018-04-23T12:27:55.497", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1283852, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2018-05-10T12:54:53.95", "lastAccessedDate": "2018-05-10T12:54:53.95", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1284351, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2018-05-28T09:22:16.657", "lastAccessedDate": "2018-05-28T09:22:16.657", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1284364, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2018-05-28T11:01:53.537", "lastAccessedDate": "2018-05-28T11:01:53.537", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1968506, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2018-08-20T18:44:09.9", "lastAccessedDate": "2018-08-20T18:44:09.9", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1285423, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2018-07-11T13:24:30.907", "lastAccessedDate": "2018-07-11T13:24:30.907", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1285523, "subscriberId": 2451061, "clientDescription": "New Client", "dateCreated": "2018-07-15T09:58:35.863", "lastAccessedDate": "2018-07-15T09:58:35.863", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1120811, "subscriberId": 2451061, "clientDescription": "PDF P2 Live", "dateCreated": "2016-07-15T23:19:01.24", "lastAccessedDate": "2016-07-15T23:19:01.24", "zoneId": 32, "parentFolders": [{ "folderNameID": 16189, "folderName": "search", "parentFolderID": null, "subscriberClientID": 1120811, "subscriberID": null, "dateCreated": "2016-11-08T13:48:05.88", "lastAccessedDate": "2016-11-08T13:48:05.88", "isVisible": true, "folders": [], "files": [{ "folderContentID": 83449, "folderNameID": 16189, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/k17qd/p8jrd/x8jrd/y8jrd/48jrd/ocklf", "lmtid": null, "title": "Method of calculating annual turnover", "contentType": "Content", "comment": null, "commentDated": "2016-11-08T13:48:30.873", "dateAdded": "2016-11-08T13:48:30.873", "zoneID": null, "isCustomView": false }, { "folderContentID": 83450, "folderNameID": 16189, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/k17qd/b8jrd/ccvsd/ecvsd/fcvsd/fbklf", "lmtid": null, "title": "The approach of the competition authorities to calculating administrative penalties", "contentType": "Content", "comment": null, "commentDated": "2016-11-08T13:48:30.9", "dateAdded": "2016-11-08T13:48:30.9", "zoneID": null, "isCustomView": false }] }, { "folderNameID": 14122, "folderName": "test", "parentFolderID": null, "subscriberClientID": 1120811, "subscriberID": null, "dateCreated": "2016-07-15T23:18:45.573", "lastAccessedDate": "2016-07-15T23:18:45.573", "isVisible": true, "folders": [], "files": [{ "folderContentID": 79013, "folderNameID": 14122, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/4w11c/p0p3c/q0p3c/e393c", "lmtid": null, "title": "Overview", "contentType": "Content", "comment": null, "commentDated": "2016-07-15T23:19:25.837", "dateAdded": "2016-07-15T23:19:25.837", "zoneID": null, "isCustomView": false }, { "folderContentID": 79014, "folderNameID": 14122, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/4w11c/p0p3c/k3lqe/m3lqe/z3lqe/l483e", "lmtid": null, "title": "Business rescue process", "contentType": "Content", "comment": null, "commentDated": "2016-07-15T23:19:25.873", "dateAdded": "2016-07-15T23:19:25.873", "zoneID": null, "isCustomView": false }, { "folderContentID": 79015, "folderNameID": 14122, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/4w11c/p0p3c/k3lqe/m3lqe/u3lqe/g483e", "lmtid": null, "title": "Elements", "contentType": "Content", "comment": null, "commentDated": "2016-07-15T23:19:25.903", "dateAdded": "2016-07-15T23:19:25.903", "zoneID": null, "isCustomView": false }, { "folderContentID": 83448, "folderNameID": 14122, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/k17qd/p8jrd/x8jrd/y8jrd/48jrd/ocklf", "lmtid": null, "title": "Method of calculating annual turnover", "contentType": "Content", "comment": null, "commentDated": "2016-11-08T13:44:12.593", "dateAdded": "2016-11-08T13:44:12.593", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1212692, "subscriberId": 2451061, "clientDescription": "PG 2016 Server MYLN", "dateCreated": "2017-05-04T14:33:08.197", "lastAccessedDate": "2017-05-04T14:33:08.197", "zoneId": 32, "parentFolders": [{ "folderNameID": 17264, "folderName": "Dev test 2016 Server", "parentFolderID": null, "subscriberClientID": 1212692, "subscriberID": null, "dateCreated": "2017-05-04T14:38:12.083", "lastAccessedDate": "2017-05-04T14:38:12.083", "isVisible": true, "folders": [], "files": [{ "folderContentID": 86287, "folderNameID": 17264, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/jilc/kilc/u4sg/vitg/njtg/hw5i/mx5i/4y5i", "lmtid": null, "title": "46.   Execution — immovables.—(1)  (a)  No writ of execution against the immovable property of any judgment debtor shall issue until—", "contentType": "Content", "comment": null, "commentDated": "2017-05-04T14:38:13.717", "dateAdded": "2017-05-04T14:38:13.717", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 433830, "subscriberId": 2451061, "clientDescription": "PG Web 03 08/07/2015", "dateCreated": "2015-07-08T11:17:18.41", "lastAccessedDate": "2015-07-08T11:17:18.41", "zoneId": 32, "parentFolders": [{ "folderNameID": 10650, "folderName": "Test", "parentFolderID": null, "subscriberClientID": 433830, "subscriberID": null, "dateCreated": "2015-07-08T11:19:57.523", "lastAccessedDate": "2015-07-08T11:19:57.523", "isVisible": true, "folders": [], "files": [{ "folderContentID": 71065, "folderNameID": 10650, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/nnscd/w2bed/x2bed/z2bed/02bed/0dlhf|isMultiView", "lmtid": null, "title": "Compulsory audits", "contentType": "Content", "comment": null, "commentDated": "2015-07-08T11:17:46.057", "dateAdded": "2015-07-08T11:17:46.057", "zoneID": null, "isCustomView": false }, { "folderContentID": 72959, "folderNameID": 10650, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/4w11c/izp3c/kzp3c", "lmtid": null, "title": "Partnership ", "contentType": "Content", "comment": null, "commentDated": "2015-10-02T13:14:52.717", "dateAdded": "2015-10-02T13:14:52.717", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1284209, "subscriberId": 2451061, "clientDescription": "PROD 22", "dateCreated": "2018-05-22T17:13:28.217", "lastAccessedDate": "2018-05-22T17:13:28.217", "zoneId": 32, "parentFolders": [{ "folderNameID": 21723, "folderName": "prod", "parentFolderID": null, "subscriberClientID": 1284209, "subscriberID": null, "dateCreated": "2018-05-22T17:13:39.807", "lastAccessedDate": "2018-05-22T17:13:39.807", "isVisible": true, "folders": [], "files": [{ "folderContentID": 94627, "folderNameID": 21723, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/4w11c/izp3c/kzp3c", "lmtid": null, "title": "Partnership ", "contentType": "Content", "comment": null, "commentDated": "2018-05-22T17:13:40.43", "dateAdded": "2018-05-22T17:13:40.43", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1968817, "subscriberId": 2451061, "clientDescription": "Reeva", "dateCreated": "2018-08-31T14:16:08.027", "lastAccessedDate": "2018-08-31T14:16:08.027", "zoneId": 32, "parentFolders": [{ "folderNameID": 23154, "folderName": "test", "parentFolderID": null, "subscriberClientID": 1968817, "subscriberID": null, "dateCreated": "2018-08-31T14:18:50.493", "lastAccessedDate": "2018-08-31T14:18:50.493", "isVisible": true, "folders": [], "files": [] }] }, { "subscriberClientId": 1285324, "subscriberId": 2451061, "clientDescription": "Search smart", "dateCreated": "2018-07-06T08:10:52.56", "lastAccessedDate": "2018-07-06T08:10:52.56", "zoneId": 32, "parentFolders": [{ "folderNameID": 22250, "folderName": "PG test", "parentFolderID": null, "subscriberClientID": 1285324, "subscriberID": null, "dateCreated": "2018-07-06T08:11:12.113", "lastAccessedDate": "2018-07-06T08:11:12.113", "isVisible": true, "folders": [], "files": [{ "folderContentID": 95533, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/4w11c/rzp3c/szp3c", "lmtid": null, "title": "Nature of tenure: Freehold and Leasehold", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:11:13.637", "dateAdded": "2018-07-06T08:11:13.637", "zoneID": null, "isCustomView": false }, { "folderContentID": 95534, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/cqsvc/oqsvc/vtc2c/5fo3c/qxo3c", "lmtid": null, "title": "Sale of a business agreement", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.643", "dateAdded": "2018-07-06T08:16:17.643", "zoneID": null, "isCustomView": false }, { "folderContentID": 95535, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/bqsvc/lqsvc/yel5c/l3k8c/8ow8c", "lmtid": null, "title": "Application for business rescue", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.653", "dateAdded": "2018-07-06T08:16:17.653", "zoneID": null, "isCustomView": false }, { "folderContentID": 95536, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/1syyd/2syyd/vbnzd/90i0d/maq8d", "lmtid": null, "title": "Sale of business agreement", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.67", "dateAdded": "2018-07-06T08:16:17.67", "zoneID": null, "isCustomView": false }, { "folderContentID": 95537, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/cqsvc/oqsvc/ntc2c/w283c/gswqe", "lmtid": null, "title": "Lease for business premises", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.68", "dateAdded": "2018-07-06T08:16:17.68", "zoneID": null, "isCustomView": false }, { "folderContentID": 95538, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/jtwjd/yuwjd/81eye/e2eye/f2eye", "lmtid": null, "title": "Business continuity plan ", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.693", "dateAdded": "2018-07-06T08:16:17.693", "zoneID": null, "isCustomView": false }, { "folderContentID": 95539, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/jtwjd/yuwjd/p2eye/q2eye/c3eye", "lmtid": null, "title": "Business continuity plan", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.703", "dateAdded": "2018-07-06T08:16:17.703", "zoneID": null, "isCustomView": false }, { "folderContentID": 95540, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/zoaue/y2i1e/caa3e/gaa3e/0ea3e", "lmtid": null, "title": "Business plan template", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.713", "dateAdded": "2018-07-06T08:16:17.713", "zoneID": null, "isCustomView": false }, { "folderContentID": 95541, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/zoaue/y2i1e/kaa3e/laa3e/n5t3e", "lmtid": null, "title": "Terms of business policy", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.727", "dateAdded": "2018-07-06T08:16:17.727", "zoneID": null, "isCustomView": false }, { "folderContentID": 95542, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/7psvc/w756d/x756d/4756d/xy4ff/8y4ff", "lmtid": null, "title": "Application for business rescue", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.737", "dateAdded": "2018-07-06T08:16:17.737", "zoneID": null, "isCustomView": false }, { "folderContentID": 95543, "folderNameID": 22250, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/njmjd/bhdwe/chdwe/ehdwe/oyhwe/xbh1e", "lmtid": null, "title": "Business plans vs business cases", "contentType": "Content", "comment": null, "commentDated": "2018-07-06T08:16:17.75", "dateAdded": "2018-07-06T08:16:17.75", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1283853, "subscriberId": 2451061, "clientDescription": "T Grindlay", "dateCreated": "2018-05-10T12:55:40.663", "lastAccessedDate": "2018-05-10T12:55:40.663", "zoneId": 32, "parentFolders": [{ "folderNameID": 21504, "folderName": "TG 1", "parentFolderID": null, "subscriberClientID": 1283853, "subscriberID": null, "dateCreated": "2018-05-10T12:56:17.503", "lastAccessedDate": "2018-05-10T12:56:17.503", "isVisible": true, "folders": [], "files": [] }] }, { "subscriberClientId": 15961014, "subscriberId": 2451061, "clientDescription": "Theron", "dateCreated": "2018-09-07T09:23:14.62", "lastAccessedDate": "2018-09-07T09:23:14.62", "zoneId": 32, "parentFolders": [{ "folderNameID": 23254, "folderName": "dimissal", "parentFolderID": null, "subscriberClientID": 15961014, "subscriberID": null, "dateCreated": "2018-09-07T09:24:23.357", "lastAccessedDate": "2018-09-07T09:24:23.357", "isVisible": true, "folders": [], "files": [{ "folderContentID": 97573, "folderNameID": 23254, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/hdltc/07r1c/17r1c/kcs1c/mcs1c|isMultiView", "lmtid": null, "title": "Exclusions and interpretation ", "contentType": "Content", "comment": null, "commentDated": "2018-09-07T09:24:33.28", "dateAdded": "2018-09-07T09:24:33.28", "zoneID": null, "isCustomView": false }] }] }, { "subscriberClientId": 1282980, "subscriberId": 2451061, "clientDescription": "Tst live", "dateCreated": "2018-03-05T11:58:50.783", "lastAccessedDate": "2018-03-05T11:58:50.783", "zoneId": 32, "parentFolders": [] }, { "subscriberClientId": 1211869, "subscriberId": 2451061, "clientDescription": "XSLT live", "dateCreated": "2017-02-15T17:43:59.23", "lastAccessedDate": "2017-02-15T17:43:59.23", "zoneId": 32, "parentFolders": [{ "folderNameID": 16690, "folderName": "test", "parentFolderID": null, "subscriberClientID": 1211869, "subscriberID": null, "dateCreated": "2017-02-15T17:44:16.297", "lastAccessedDate": "2017-02-15T17:44:16.297", "isVisible": true, "folders": [], "files": [{ "folderContentID": 84719, "folderNameID": 16690, "caseID": 0, "flagID": 0, "trashID": 0, "url": "zb/a2ioc/b2ioc/55cwc/73r1c/83r1c/a6r1c/b6r1c", "lmtid": null, "title": "Tax treaty or no tax treaty", "contentType": "Content", "comment": null, "commentDated": "2017-02-15T17:44:12.707", "dateAdded": "2017-02-15T17:44:12.707", "zoneID": null, "isCustomView": false }] }] }];
}
