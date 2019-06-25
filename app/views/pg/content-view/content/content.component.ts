import { Component, NgZone, OnInit, ViewChild, TemplateRef, PlatformRef } from '@angular/core';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { ContentService } from '../../../../shared/services/content/content.service';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CompileDirective } from '../../../../shared/directives/compile.directive';
import { EmailModalService } from '../../../../shared/services/email-modal/email-modal.service';
import { ContentInfo } from '../../../../shared/models/content/contentInfo.model';
import { GuidanceNoteService } from '../../../../shared/services/guidance-note/guidance-note.service';
import { WhatsNewService } from '../../../../shared/services/whats-new/whats-new.service';
import { PgMessages } from '../../../../shared/constants/messages';
import { PagerService } from '../../../../shared/services/pager/pager.service';
import { ContentSafePipe } from '../../../../shared/pipes/content-safe/content-safe.pipe';

@Component({
    selector: 'content-view',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  @ViewChild(CompileDirective) compile: CompileDirective;
  constructor(private _contentService: ContentService,
    private _dataStoreService: DataStoreService,
    private _navigationService: NavigationService,
    private modalService: BsModalService,
    private _emailModalService: EmailModalService,
      private _guidanceNoteService: GuidanceNoteService,
      private _whatsNewService: WhatsNewService,
      private _pagerService: PagerService,
      private zone: NgZone,
  ) {
      window['angularComponentRef'] = {
          zone: this.zone,
          openLContent: (dpath) => this.openLContent(dpath),
          openDContent: (dpath) => this.openDContent(dpath),
          openLibContent: (domainPath, selectedTabName, selectedTabIndex) =>
              this.openLibContent(domainPath, selectedTabName, selectedTabIndex),
          openMultiViewLibContent: (domainPath, selectedTabName, selectedTabIndex, isMultiView, domainId) =>
              this.openMultiViewLibContent(domainPath, selectedTabName, selectedTabIndex, isMultiView, domainId),

          component: this,
      }; 
  }
        rendrContentRequest: RenderContentRequest = new RenderContentRequest();
        contentHTML: string;
        newItem: any;
        modalRef: BsModalRef;
        permaLink: string = "";
        downloadModalRef: BsModalRef;
        @ViewChild('modalContent') modalContent: TemplateRef<any>;
        saveToFolderContent;
        loadFolders;
        showChildContent: boolean = false;
        contentDetail: string = '';
        authorNames: string = "";
        isPDF = false; pdfContent: any; pdfTitle: string = "";
        contentInfo: ContentInfo;
        practiceArea: string = "";
        rootArea: string = "";
        essentials;
        backButton: boolean = true;
        title: string ="";
        topic: string = "";
        previousNewItem: any;
        previousNewItems: any = [];
        initialDPath: string = '';
    domainPath: string = '';
    libContent: boolean = false;
    ngOnInit() {
        this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");
        this.initialDPath = this.newItem.dapth ? this.newItem.dpath : this.newItem.domainPath;
        this.domainPath = this.newItem.dapth ? this.newItem.dpath : this.newItem.domainPath;
        this.previousNewItem = this.newItem;
        this.previousNewItems.push(this.newItem);
        if (this.newItem.back != undefined && this.newItem.back == false) {
            this.backButton = false;
        }
        var isInlineDownload = this._dataStoreService.getSessionStorageItem("IsInlineDownload");
        if (!isInlineDownload) {
            this.getContent();
        } else {
            if (this.domainPath.startsWith('zb/a2ioc')) {
                this.contentHTML = this._dataStoreService.getSessionStorageItem("htmlContent");
            } else {
                this.rendrContentRequest.dpath = this.newItem.domainPath;
                this.rendrContentRequest.hasChildren = this.newItem.hasChildren;
                this.downloadContent(this.rendrContentRequest.dpath, this.rendrContentRequest.hasChildren);

            }
        }
        this._pagerService.setPageView();
        //window.scrollTo(0, 0);
        /*
        let scrollEle = document.getElementById('newpg');
        if (window.navigator.userAgent.indexOf("Edge") == -1)
            scrollEle.scrollTo(0, 0);
        else
            scrollEle.scrollTop = 0;*/
    }

    getContent() {
        this.rendrContentRequest.dpath = this.newItem.domainPath;
        this.rendrContentRequest.hasChildren = this.newItem.hasChildren;
        if (this.newItem.newsCategory != undefined && this.newItem.practiceAreaTitle != undefined && this.newItem.domainPath != undefined) {
            this._whatsNewService.getWhatsNewDetail(this.newItem).subscribe(data => {
                if (data) {
                    if (data.mimeType == "text/html") {
                        this.showChildContent = true;
                        this.contentDetail = data.fileStrContent;//this.buildHtml(this._contentService.getHtmlContent(data.fileContent));
                        //this.contentDetail = this.buildNewHTML(data.fileStrContent);
                        this.authorNames = data.authorName;
                        if (data.title) {
                            this.newItem["title"] = data.title;
                        } else {
                            this.newItem["title"] = data.fileName.split('.htm')[0];
                        }
                        if (this.newItem.back != undefined && this.newItem.back == false) {
                            this.backButton = false;
                        }
                        if (this.compile) {
                            this.compile.compile = this.contentDetail;
                            this.compile.compileContext = this;
                            this.compile.compRef.changeDetectorRef.detectChanges();
                            this.compile.ngOnChanges();
                        }
                        

                    } else if (data.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                        this.isPDF = true;
                        this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + (this.rendrContentRequest.dpath.split("/").pop());
                        this.pdfTitle = data.fileName;
                        //window.scrollTo(0, 0);
                        this._pagerService.setPageView();
                        /*
                        let scrollEle = document.getElementById('newpg');
                        if (window.navigator.userAgent.indexOf("Edge") == -1)
                            scrollEle.scrollTo(0, 0);
                        else
                            scrollEle.scrollTop = 0;
                        */
                    } else {
                        this.showChildContent = true;
                        this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
                    }
                }
            });
        } else {
            this.downloadContent(this.rendrContentRequest.dpath, this.rendrContentRequest.hasChildren);
        }
    }

    navigate() {
        this._navigationService.nextRoute;
    }

    back() {
        let previous = this._navigationService.getPreviousRoute();
        if (previous && previous != null && previous.previousRoute && (previous.previousRoute.startsWith('/permalink-view')
            || previous.previousRoute.startsWith('/guidance-note/guidance-note-detail')
            || previous.previousRoute.startsWith('/login'))
           ) {
            this.isPDF = false;
            var newItem;

            if (this.previousNewItems.length > 1) {
                newItem = this.previousNewItems[this.previousNewItems.length - 1];
                
                this.previousNewItems = this.previousNewItems.slice(this.previousNewItems.length - 1);
                
            } else {
                newItem = this.previousNewItem;
                this.previousNewItems = [];
            }
            this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
            this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
            this.newItem = newItem;
            this.getContent();
        
        } else {
            if (previous.previousRoute != undefined) {
                this._navigationService.navigate(previous.previousRoute, this._navigationService.getStateParams(previous.previousRoute));
            }
        } 
    }

    openModal(template: TemplateRef<any>) {
        var content = { "title": this.newItem.title, "url": this.newItem.domainPath, "searchResult": null };
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));
        this.getFoldersAll(template);
    }

    getFoldersAll(template) {
        this.loadFolders = true;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false });
    }

    onPopUpCloseClick() {
        this.modalRef.hide();
    }
    setCurrentNewItem(dpath: string, hasChildren: string) {
        var newItem = { "domainPath": dpath, "hasChildren": hasChildren ? hasChildren : false };
        this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
        this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
        this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");

    }
    openMVContent(dpath: string, hasChildren: string) {
        if (!dpath.startsWith("zb/a2ioc")) {
            var divElmnt = document.getElementById("docp");
            divElmnt.classList.add("libcontent-div");
        }
        this.previousNewItem = this.newItem;
        this.previousNewItems.push(this.newItem);
        this.setCurrentNewItem(dpath.split('#')[0], hasChildren);
        this.downloadContent(dpath.split('#')[0], hasChildren);
  }
    ngAfterViewInit() {

        if (!this.domainPath.startsWith("zb/a2ioc")) {
            this.libContent = true;
            //var divElmnt = document.getElementById("docp");
            //divElmnt.classList.add("libcontent-div");
        }

    }
  downloadContent(dpath, hasChildren) {
    var rendRequest = new RenderContentRequest();
    rendRequest.dpath = dpath;
    rendRequest.hasChildren = hasChildren;
      this.showChildContent = false;
      //var domainId = dpath.split('/')[dpath.split('/').length - 1];
      if (this.isPgDomainPath(dpath)) {
          this.domainPath = dpath;
          var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
          var selectedPracticeArea = practiceAreas.find(nI => dpath.includes(nI.domainId));
          this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
          let num = 0;
          var domainPathLength = dpath.split('/').length;
          num = this.isPgModule(dpath) ? 5 : 4;
          if (selectedPracticeArea.type == 'PA-MD') {
              var allPAs = this._dataStoreService.getSessionStorageItem("AllModulesPAs");
              var paModule = allPAs.find(item => dpath.split('/')[3] == item.domainId);
              var topic = (paModule !== undefined) ? paModule.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId) : undefined;
              var subtopic = (topic !== undefined) ? topic.subTocItem.find(nI => dpath.split('/')[5] == nI.domainId) : undefined;
              this.rootArea = (topic !== undefined) ? paModule.title : '';
              this.practiceArea = (subtopic !== undefined) ? subtopic.title : '';
              
          } else {
              var topic = selectedPracticeArea.subTocItem.find(item => dpath.split('/')[3] == item.domainPath.split('/')[3]);
              var subtopic = (topic !== undefined) ? topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId) : undefined;
              this.rootArea = (topic !== undefined) ? selectedPracticeArea.title : '';
              this.practiceArea = (subtopic !== undefined) ? subtopic.title : '';
          }
          
         
      }
    
    this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");
    this._contentService.downloadContent(rendRequest).subscribe(data => {        
        if (data.mimeType == "text/html") {
            this.showChildContent = true;
            this.contentDetail = data.fileStrContent;//this.buildHtml(this._contentService.getHtmlContent(data.fileContent));
            //this.contentDetail = this.buildNewHTML(data.fileStrContent);
            if (data.title) {
                this.newItem["title"] = data.title;
            } else {
                this.newItem["title"] = data.fileName ? data.fileName.split('.htm')[0] : '';
            }
            if (data.fileStrContent != undefined && data.fileStrContent == "We are experiencing content issues, please try later.") {
                this.backButton = true;
            }
            if (this.newItem.back != undefined && this.newItem.back == false) {
                this.backButton = false;
            } else {
                this.backButton = true;
            }
            //if (this.checkHTML(data.fileStrContent)) {
            //    this.newItem["title"] = data.fileName ? data.fileName.split('.htm')[0] : '';
            //    this.contentDetail = "The content is not formated properly";
            //    this.backButton = true;
            //}
            this.authorNames = data.authorName;
            if (this.compile != undefined) {
                this.compile.compile = this.contentDetail;
                this.compile.compileContext = this;
                this.compile.compRef.changeDetectorRef.detectChanges();
                this.compile.ngOnChanges();
            }
            
        } else if (data.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
            this.backButton = true;
            this.isPDF = true;
            this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + rendRequest.dpath.split("/").pop();
            this.pdfTitle = data.fileName.split('.pdf')[0];
            this.newItem.title = data.fileName.split('.pdf')[0];
            this._pagerService.setPageView();
            //window.scrollTo(0, 0);
            /*
            let scrollEle = document.getElementById('newpg');
            if (window.navigator.userAgent.indexOf("Edge") == -1)
                scrollEle.scrollTo(0, 0);
            else
                scrollEle.scrollTop = 0;
            */
        } else {
            this.newItem.title = data.fileName ? data.fileName.split('.doc')[0] : '';
            if (this.newItem.back != undefined && this.newItem.back == false) {
                this.backButton = false;
            } else {
                this.backButton = true;
            }
            this.showChildContent = true;
            this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
        }
      
    });


    }

    checkHTML(html) {
        var doc = document.createElement('div');
        doc.innerHTML = html;
        return doc.innerHTML == html;
    }
    
  isPADPath(domainPath: string, domainId: string) {
        var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
        var dPathLength = domainPath.split('/').length;
        if (dPathLength >= 3) {
            var selectedPracticeArea = practiceAreas.find(nI => domainPath.split('/')[2] == nI.domainPath.split('/')[2]);
            this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
            //var topic = selectedPracticeArea.subTocItem.find(item => domainPath.split('/')[3] == item.domainPath.split('/')[3]);
            //var subtopic = topic.subTocItem.find(nI => domainPath.split('/')[4] == nI.domainPath.split('/')[4]);
            if (selectedPracticeArea) return true;

        }

        return false;
    }


    openMultiViewLibContent(domainPath: string, selectedTabName: string, selectedTabIndex: string, isMultiView: boolean, domainId: string) {
      this.previousNewItems.push(this.newItem);
      this.setCurrentNewItem(domainPath, "false");
      var dpath = domainPath;
      this.domainPath = domainPath;
      var domainPathLength = dpath.split('/').length;
      let input = {};
      input["extDpath"] = dpath;
      input["isSubTopic"] = "";
      input["permalink"] = "";
      input["contentZone"] = 32;
      this.backButton = true;
      this._contentService.GetContentType(input).subscribe(data => {
          this.contentInfo = data;

          switch (data.contentPageType) {
              case PgConstants.constants.ContentPageType.Content:
                  if (this._contentService.isPgDomainPath(domainPath)) {
                      var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
                      var topic = selectedPracticeArea.subTocItem.find(item => domainPath.split('/')[3] == item.domainPath.split('/')[3]);
                      var subtopic = topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId);
                      var domainPathLength = dpath.split('/').length;
                      
                      this.practiceArea = subtopic.title;
                      this.rootArea = selectedPracticeArea.title;
                      let inputdata = {
                          "practiceArea": subtopic.title,
                          "rootArea": selectedPracticeArea.title,
                          "subTopic": subtopic,
                          "subTopicDomainPath": subtopic.domainPath,
                          "title": selectedPracticeArea.title + " > " + subtopic.title,
                      }

                      var guidancedetail = {
                          "domainPath": dpath,
                          "domainId": dpath.split('/')[domainPathLength - 1],
                          "parentDomainId": dpath.split('/')[domainPathLength - 2],
                          "title": data.title,
                          "practiceArea": selectedPracticeArea.title,
                          "topic": subtopic.title,
                          "subtopic": subtopic,
                          "essentials": [],
                          "hasChildren": true
                      };
                      if (domainPathLength == 6 || domainPathLength == 8) {

                          if (selectedPracticeArea.domainId == 'b2ioc' || selectedPracticeArea.domainId == 'nor6d') {
                              var allPAs = this._dataStoreService.getSessionStorageItem("AllModulesPAs");
                              var spa = allPAs.find(nI => domainPath.split('/')[3] == nI.domainId);
                              var paTitle = spa.title;
                              var paModule = selectedPracticeArea.subTocItem ? selectedPracticeArea.subTocItem.find(nI => domainPath.split('/')[3] == nI.domainId) : {};
                              topic = paModule.subTocItem.find(nI => domainPath.split('/')[4] == nI.domainId);
                              subtopic = topic.subTocItem.find(nI => domainPath.split('/')[5] == nI.domainId);
                              var guidancedetail = {
                                  "domainPath": dpath,
                                  "domainId": dpath.split('/')[domainPathLength - 1],
                                  "parentDomainId": dpath.split('/')[domainPathLength - 2],
                                  "title": data.title,
                                  "practiceArea": paTitle,
                                  "topic": subtopic.title,
                                  "subtopic": subtopic,
                                  "essentials": [],
                                  "hasChildren": true
                              };
                              this.getGNdetailData(inputdata, guidancedetail);
                              this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
                              this._dataStoreService.setSessionStorageItem("selectedNewItem", this.previousNewItems[this.previousNewItems.length - 1]);
                              this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");

                          } else {
                              var newItem = { "domainPath": dpath, "hasChildren": false };
                              this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
                              this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
                              this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");
                              //this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
                              this.getContent();

                          }
                          
                      } else {
                          if (selectedPracticeArea.domainId == 'b2ioc' || selectedPracticeArea.domainId == 'nor6d') {
                              var newItem = { "domainPath": dpath, "hasChildren": false };
                              this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
                              this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
                              this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");
                              //this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
                              this.getContent();
                          } else {

                              this.getGNdetailData(inputdata, guidancedetail);
                              this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
                              this._dataStoreService.setSessionStorageItem("selectedNewItem", this.previousNewItems[this.previousNewItems.length - 1]);
                              this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");
                          }
                      }
                  }
                  break;
              case PgConstants.constants.ContentPageType.PractiseArea:
                  //console.log("Practice Area");
                  this.openLContent(domainPath);
                  break;
              case PgConstants.constants.ContentPageType.SubTopic:
                  //console.log("Subtopic");
                  this.openLContent(domainPath);
              case PgConstants.constants.ContentPageType.Topic:
                  //console.log("Topic");
                  this.openLContent(domainPath);
                  break;
              default:
                  //console.log("none has matched");
          }

      });

  }
    openLibContent(domainPath: string, selectedTabName: string, selectedTabIndex: string) {
        if (!domainPath.startsWith("zb/a2ioc")) {
            var divElmnt = document.getElementById("docp");
            divElmnt.classList.add("libcontent-div");
        }
        this.openLContent(domainPath);
  }
    openLContent(domainPath: string) {
        if (!domainPath.startsWith("zb/a2ioc")) {
            var divElmnt = document.getElementById("docp");
            divElmnt.classList.add("libcontent-div");
        }
        this.backButton = true;
        this.previousNewItem = this.newItem;
        this.previousNewItems.push(this.newItem);
        this.setCurrentNewItem(domainPath, "false");
        var splitArray = domainPath.split('/');
        domainPath = splitArray[splitArray.length - 1];
        this.downloadContent(domainPath, "false");
  }

  buildHtml(input: string): string {
  
        var regex1 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...','PGS/ContentView.aspx[?]dpath[=]`);
        var regex2 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...', 'Library/ContentView.aspx[?]dpath[=]`);
        var regex3 = new RegExp(`src[=]"/Content/ContentResponse.aspx[?]dpath[=]`);
        var regex4 = new RegExp(`(?<=authorsNames">)(.*)(?=<\/span>)`, 'g');
        var titleRegex = new RegExp(`(?<=title">)(.*)(?=<\/title>)`, 'g');
        if (titleRegex.test(input)) {
            var fileTitle = input.match(titleRegex)[0];
        }

        if (regex4.test(input)) {
            var authorNames = input.match(regex4)[0];
        }
        //  input = input.replace(new RegExp('<p', 'g'), "<div");
        //  input = input.replace(new RegExp('</p>', 'g'), "</div><br />");
        input = input.replace(new RegExp('&#xD;&#xA;&#x9;&#x9;&#x9;&#x9;&#x9;', 'g'), "");
        input = input.replace(new RegExp('&#13;&#10;&#9;&#9;&#9;&#9;&#9;', 'g'), "");
        input = input.replace(new RegExp('&#xD;&#xA;            ', 'g'), "");
        input = input.replace(new RegExp('&#xA;            ', 'g'), "");
        input = input.replace(new RegExp('&#x9;', 'g'), "");
        input = input.replace(new RegExp(`onclick="openLContent`, 'g'), `(click)="openLContent`);
        input = input.replace(new RegExp(`onclick="openMVContent`, 'g'), `(click)="openMVContent`);
        input = input.replace(new RegExp(regex1, 'g'), `(click)="openDContent('`);
        input = input.replace(new RegExp(regex2, 'g'), `(click)="openDContent('`);
        input = input.replace(new RegExp(`href="#`, 'g'), `class="underLine`);
        input = input.replace(new RegExp('[^\u0000-\u007F]', 'g'), ' ');
        input = input.replace(new RegExp('.jpg"', 'g'), `.jpg'"`);
        input = input.replace(new RegExp(regex3, 'g'), `[image-src]="'`);
        input = input.replace(new RegExp('.JPG"', 'g'), `.JPG'"`);
        input = input.replace(new RegExp('.png"', 'g'), `.png'"`);
        return input;
    }

    openDContent(domainPath: string) {
        if (!domainPath.startsWith("zb/a2ioc")) {
            var divElmnt = document.getElementById("docp");
            divElmnt.classList.add("libcontent-div");
        }
        this.backButton = true;
        this.previousNewItem = this.newItem;
        this.previousNewItems.push(this.newItem);
        if (domainPath.indexOf('#') !== -1) {
            this.setCurrentNewItem(domainPath.split('#')[0], "false");
        } else {
            this.setCurrentNewItem(domainPath, "false");
        }
        if (domainPath.indexOf('#') !== -1) domainPath = domainPath.split('#')[0];
        this.downloadContent(domainPath, "false");
    }

    openEmailModal() {
        this._emailModalService.open(this.newItem.domainPath, "true");
    }
    getPermaLink() {
        var dpath = this.newItem.domainPath;
        this._contentService.GetPermaLink({ dPath: dpath }).subscribe(data => {
            if (data !== null) {
                this.permaLink = window.location.host + data;
            }
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

    getGNdetailData(viewModel, guidanceDetail) {

        this._guidanceNoteService.getHomeContentForSubTopic(viewModel).subscribe(data => {
            var subTopicData = data;
            var guidances = [];
            var commentarys = [];
            var legislations = [];
            var caseLaws = [];

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
            commentarys = subTopicData.result.commentary;
            legislations = subTopicData.result.legislation;
            caseLaws = subTopicData.result["case law"];
            guidanceDetail["guidances"] = guidances;
            guidanceDetail.essentials = this.essentials;
            guidanceDetail.redirectedFrom = "folder-detail";
         
            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
        }, error => {

            //this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
        });

    }
    openPermaLinkModal(template: TemplateRef<any>) {
        var dpath = this.newItem.domainPath;
        if (this.permaLink != "") {
            this.downloadModalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
            setTimeout(function () {
                var inputElmnt = (document.querySelector("input#permalinkContent") as HTMLInputElement);
                inputElmnt.focus();
                inputElmnt.setSelectionRange(0, 200, "forward");//inputElmnt.value.length);
            }, 200);
            this.modalService.onShown.subscribe((next, error, complete) => {
                //console.log("Shwon");
                try {
                    (document.querySelector("input#permalinkContent") as HTMLInputElement).select();
                }
                catch (e) {

                }
            });
            this.modalService.onShow.subscribe((next, error, complete) => {
                //console.log(this.modalService.getModalsCount());
                //console.log("Show");
                try {
                    (document.querySelector("input#permalinkContent") as HTMLInputElement).select();
                }
                catch (e) {

                }
            });
        }
        else {
            this._contentService.GetPermaLink({ dPath: dpath }).subscribe(data => {
                if (data !== null) {
                    this.permaLink = data;
                    this.downloadModalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
                    this.modalService.onShown.subscribe((next, error, complete) => {
                        //console.log("Shwon");
                        try {
                            (document.querySelector("input#permalinkContent") as HTMLInputElement).select();
                        }
                        catch (e) {

                        }
                    });
                    this.modalService.onShow.subscribe((next, error, complete) => {
                        //console.log(this.modalService.getModalsCount());
                        //console.log("Show");
                        try {
                            (document.querySelector("input#permalinkContent") as HTMLInputElement).select();
                        }
                        catch (e) {

                        }
                    });
                }
            });
        }



    }

    breadCrumbNavigation(routes, route) {
        var domainPath = this.domainPath;
        var dpath = this.domainPath;
        var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
        var selectedPracticeArea = practiceAreas.find(pa => domainPath.split('/')[2] == pa.domainId);
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
        var topic = undefined;
        var subtopic = undefined;
        var allPAs = this._dataStoreService.getSessionStorageItem("AllModulesPAs");

        if (selectedPracticeArea.type == 'MD') {

            var paModule = allPAs.find(item => dpath.split('/')[3] == item.domainId);
            selectedPracticeArea = paModule;
            topic = (paModule !== undefined) ? paModule.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId) : undefined;
            subtopic = (topic !== undefined) ? topic.subTocItem.find(nI => dpath.split('/')[5] == nI.domainId) : undefined;

        } else {
            topic = selectedPracticeArea.subTocItem.find(item => dpath.split('/')[3] == item.domainPath.split('/')[3]);
            subtopic = (topic !== undefined) ? topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId) : undefined;
        }

        if (route == 'guidanceNote') {
            var input = {
                "subTopicDomainPath": subtopic.domainPath,
                "title": selectedPracticeArea.title + " > " + subtopic.title,
                "practiceArea": subtopic.title, rootArea: selectedPracticeArea.title,
                "subTopic": subtopic
            };

            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
        } else if (route == 'subTopic') {
            this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(selectedPracticeArea));
        }
        
    }
    get subtopicBreadCrumb() {
        return this._navigationService.routes.find(r => r.currentRoute == '/sub-topics');
    }

    get guidanceNoteBreadCrumb() {
        return this._navigationService.routes.find(r => r.currentRoute == '/guidance-note');
    }

    get guidanceNoteDetailBreadCrumb() {
        return this._navigationService.routes.find(r => r.currentRoute.indexOf('guidance-note-detail') > -1);
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
    openWin(arg) {

    }
}
