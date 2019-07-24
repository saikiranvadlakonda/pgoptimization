import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { UserService } from '../../../../shared/services/user/user.service';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import 'rxjs/add/operator/delay';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../../shared/services/content/content.service';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { PracticeAreaService } from '../../../../shared/services/practice-areas/practice-areas.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [ContentService]
})
export class LoginComponent implements OnInit {

    @Input() userName: string;
    @Input() password: string;
    @Input() myLNUrl: string;

    constructor(
        private _authService: AuthService,
        private _navigationService: NavigationService,
        private _dataStoreService: DataStoreService,
        private route: ActivatedRoute,
        private _contentService: ContentService,
        private _practiceAreaService: PracticeAreaService,
    ) { }

    ngOnInit() {
        this.login();
    }

    public login(): void {
        
        let token: string = this.route.snapshot.queryParamMap.get('pgNew');
        if (token) {
            token = decodeURIComponent(token);
        }
        
        if (this.route.snapshot.queryParamMap.keys.length > 0) {
            let subscriberClientId = this.route.snapshot.queryParamMap.get('subscriberClientId');
            let subscriberId = this.route.snapshot.queryParamMap.get('subscriberId');
            let username = this.route.snapshot.queryParamMap.get('userName');
            let password: string = this.route.snapshot.queryParamMap.get('encPassword');
            if (password != null) {
                this.password = decodeURIComponent(password);
                document.getElementById("myHeader1").style.display = "block";
                document.getElementById("newpg").style.height = "100%";
                document.getElementById("newpg").style.marginBottom = "0px";
                document.getElementById("newpg").style.marginTop = "125px";
                document.getElementById("myHeader1").style.visibility = "visible";
            }
            if (this.route.snapshot.queryParamMap.get('username') != null) {
                username = this.route.snapshot.queryParamMap.get('username');
            }
            if ((username && subscriberClientId && subscriberId) || password != null) {
                this.userName = username;
                this._dataStoreService.setSessionStorageItem("uName", username);
                this._dataStoreService.setSessionStorageItem("subscriberId", subscriberId);
                this._dataStoreService.setSessionStorageItem("subscriberClientId", subscriberClientId);


                if (this.userName != null && (subscriberId || password != null)) {
                    this._authService.login(this.userName, this.password).subscribe((response) => {
                        if (response != null) {
                            if (token != null)
                                response.token = token;
                            this._dataStoreService.setSessionStorageItem('userToken', response);
                            this._authService.getUserInfo().subscribe(userInfo => {
                                if (userInfo) {
                                    this._dataStoreService.setSessionStorageItem("userInfo", userInfo);
                                    const dpath: string = this.route.snapshot.queryParamMap.get('permalink');
                                    const extDpath: string = this.route.snapshot.queryParamMap.get('extDpath');
                                    if (dpath) {
                                        let input = {};
                                        input["permalink"] = dpath;
                                        input["extDpath"] = extDpath;
                                        input["subscriberClientId"] = subscriberClientId;
                                        input["subscriberId"] = subscriberId;
                                        this._navigationService.navigate(PgConstants.constants.URLS.PermalinkView.Permalink, new StateParams(input));
                                    }
                                    else {
                                        var fromPgMobi: string = this.route.snapshot.queryParamMap.get('fromPgMobi');
                                        const extDpath: string = this.route.snapshot.queryParamMap.get('extDpath');
                                        const dpath = extDpath;
                                        if (fromPgMobi == 'yes') {
                                            this._practiceAreaService.getPracticeAreas().subscribe(pas => {
                                                if (pas != null) {
                                                    this._dataStoreService.setSessionStorageItem("AllPracticeAreas", pas);
                                                    let input = {};
                                                    input["extDpath"] = dpath;
                                                    input["isSubTopic"] = "";
                                                    input["permalink"] = "";
                                                    input["contentZone"] = 32;
                                                    this._contentService.GetContentType(input).subscribe(data => {
                                                        switch (data.contentPageType) {
                                                            case PgConstants.constants.ContentPageType.Content:

                                                                this._contentService.showContentByDomainPath(extDpath, "yes", { "title": "Content" });
                                                                break;
                                                            case PgConstants.constants.ContentPageType.PractiseArea:
                                                                break;
                                                            case PgConstants.constants.ContentPageType.SubTopic:
                                                                var fromLib = fromPgMobi;
                                                                this._contentService.setModulesAsPracticeAreas(pas);
                                                                var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
                                                                var allPAs = this._dataStoreService.getSessionStorageItem("AllModulesPAs");

                                                                let selectedPA = practiceAreas.find(pa => dpath.indexOf(pa.domainPath) == 0);
                                                                this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPA);
                                                                var topic = selectedPA.subTocItem ? selectedPA.subTocItem.find(nI => dpath.split('/')[3] == nI.domainId) : {};
                                                                var subTopic = topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId);
                                                                var input = undefined;
                                                                var paTitle = selectedPA.title;
                                                                if (subTopic != null && selectedPA.domainId == 'b2ioc' || selectedPA.domainId == 'nor6d') {
                                                                    var spa = allPAs.find(nI => dpath.split('/')[3] == nI.domainId);
                                                                    this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", spa);
                                                                    paTitle = spa.title;
                                                                    subTopic = subTopic.subTocItem.find(nI => dpath.split('/')[5] == nI.domainId);
                                                                    subTopic.redirectedFrom = "folder-detail";
                                                                    input = {
                                                                        "subTopicDomainPath": subTopic.domainPath,
                                                                        "title": paTitle + " > " + subTopic.title,
                                                                        "practiceArea": subTopic.title,
                                                                        "rootArea": paTitle,
                                                                        "subTopic": subTopic,
                                                                        "fromLib": fromLib == 'yes' ? true : false
                                                                    };
                                                                } else {
                                                                    subTopic = topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId);
                                                                    subTopic["redirectedFrom"] = "folder-detail";
                                                                    input = {
                                                                        "subTopicDomainPath": subTopic.domainPath,
                                                                        "title": paTitle + " > " + subTopic.title,
                                                                        "practiceArea": subTopic.title,
                                                                        "rootArea": paTitle,
                                                                        "subTopic": subTopic,
                                                                        "fromLib": fromLib == 'yes' ? true : false
                                                                    };
                                                                }
                                                                if (subTopic != null && subTopic.type == "ST" && subTopic.domainId == data.contentId) {
                                                                    this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
                                                                }
                                                                break;
                                                            case PgConstants.constants.ContentPageType.Topic:
                                                                break;
                                                            default:
                                                        }
                                                    })
                                                }
                                            });
                                        } else {
                                            this._navigationService.navigate(PgConstants.constants.URLS.Dashboard.Dashboard);
                                        }
                                    }                                    
                                }
                            });

                        }
                    });
                }
                else {
                    window.location.href = this.myLNUrl;
                }
            }
        } else {
            window.location.href = this.myLNUrl;
        }
    }

    navigateToContentView(newItem) {
        this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
        this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
        this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
    }
}
