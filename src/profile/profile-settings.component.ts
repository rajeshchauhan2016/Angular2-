import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/subscription';
import { ConfirmationService } from 'primeng/primeng';
import { ISiteApiResponse, SiteApiResponseUtilities } from 'shared/services/SiteApiResponse';
import { LookupService } from 'shared/services/lookup.service';
import { ProfilePicDialogService, ProfilePicDialogMode } from 'shared/dialogs/profile-pic/dialog.service';
import { AuthService } from 'auth/auth.service';
import { State } from 'shared/services/usa-states';
import { environment } from 'environments/environment';
import { constants } from 'environments/constants';
import { ProfileService } from '../profile.service';
import { masks } from 'shared/view/masks';
import { patterns } from 'shared/view/regex-patterns';
import { CrewRole } from 'shared/services/CrewRole';
import { UnionType } from 'shared/services/UnionType';
import { Cities } from 'shared/services/Cities'
import * as utils from 'shared/lang/object';
import { Budget, Budgets } from 'shared/services/Budget';
import { BudgetProfile } from 'shared/services/BudgetProfile'
import { ProfileStatusTypes } from 'shared/services/ProfileStatusTypes';
import { NotificationsService } from 'angular2-notifications';
import { BudgetList,Organizations } from './models';

import {
    UpdateProfileSettingsRequest,
    ProfileSettingsPage,
    PdfUploadResponse,
    UpdatePersonalInfo,
    UpdatePortfolio
} from './models';

import { ProfilePicDialog } from 'shared/dialogs/profile-pic/dialog.component';
import { debug } from 'util';
import { debounce } from 'rxjs/operators/debounce';
import { BudgetLevels } from 'shared/services/BudgetLevels';
import { detachProjectedView } from '@angular/core/src/view/view_attach';
@Component({
    selector: 'ij-profile-settings',
    templateUrl: 'profile-settings.component.html',
    styleUrls: ['settings.less'],
    providers:[ConfirmationService]
})
export class ProfileSettingsComponent implements OnInit {
    confirmAcceptLabel = "Yes";
    enableDelete:boolean = true;
    public orgPassCode: string;
    public orgmodel: Organizations;
    private organizations: Organizations[];
    private oragnisationValidation: string;
    public submitted: boolean;
    public states: State[];
    public budgets = Budgets;
    public AllBudgets: BudgetProfile[] = [];
    public crewRoleSuggestions: string[];
    public allCitiesSuggestions: string[];
    public allUnionTypeSuggestions: string[];
    public allGenderTypeSuggestions: string[];
    public allCrewRoles: CrewRole[] = [];
    public unionTypes: UnionType[] = [];
    public AllCities: Cities[] = [];
    public allStateTypeSuggestions: string[];
    public model: ProfileSettingsPage;
    public allBudgetSuggestions: string[];
    public nameRegex = patterns.name;
    public imdbIdRegex = patterns.imdbId;
    public zipCodeMask = masks.zipCode;
    public phoneMask = masks.phone;
    public phoneRegex = patterns.phone;
    public urlRegex = patterns.url;
    public zipCodeRegex = patterns.zipCode;

    public maxGearFileSize = constants.gear.maxSize;
    public maxResumeFileSize = constants.resume.maxSize;

    public showSaveErrored: boolean;

    public genders = [];
    public profileUrl: string = null;
    public errors: string[] = [];
    public activeTab: string = 'portfolio';
    public budgetLevelList: BudgetList[] = [];
    BudgetList: BudgetList[] = [];
    budgetLevel: BudgetLevels;

    set isProfileActive(v: boolean) {
        this.model.profileStatus = v ? ProfileStatusTypes.Active : ProfileStatusTypes.Inactive;
        this.onStatusChanged();
    }

    get isProfileActive() {
        return this.model.profileStatus == ProfileStatusTypes.Active ? true : false;
    }

    @ViewChild('fuGear') fuGear;
    public gearUrl = environment.endpoints.upload.gear;

    @ViewChild('fuResume') fuResume;
    public resumeUrl = environment.endpoints.upload.resume;

    private crewSub: ISubscription;
    private saveSub: ISubscription;
    private getSub: ISubscription;
    private citiesSub: ISubscription;
    private respUtils = new SiteApiResponseUtilities();


    constructor(
        private route: ActivatedRoute,
        private lookupSvc: LookupService,
        private profileSvc: ProfileService,
        private authSvc: AuthService,
        private proPicSvc: ProfilePicDialogService,
        private notificationSvc: NotificationsService,
        private router: Router,
        private confirmSvc: ConfirmationService
    ) {
        this.states = this.lookupSvc.getStates().slice(1);
    }

    onTab(tab: string) {
        this.activeTab = tab;
        this.showSaveErrored = false;
    }

    ngOnInit() {
        this.getAllOrganizations();
        this.showSaveErrored = false;
        this.lookupSvc.getUnionTypes().subscribe(unionTypeList => {
            this.unionTypes = unionTypeList;
        });

        this.getSub = this.route.data.subscribe((data: { settings: ProfileSettingsPage }) => {
            this.onBuildModel(data.settings);


        });
        this.crewSub = this.lookupSvc.getCrewRoles().subscribe(crewRoles => {
            this.allCrewRoles = crewRoles;
        });

        this.citiesSub = this.lookupSvc.getCities().subscribe(profileCities => {
            this.AllCities = profileCities;
        });
        this.setGenders();
        this.setState();
        this.setBudgetList();
        this.AllBudgets = this.BudgetList;
    }


    getOrganization() {
      
        this.profileSvc.getOrganizationDetail(this.model.passCode).subscribe(detail => {
            // this.getAllOrganizations();
          if (typeof (detail) == 'string') {
            this.oragnisationValidation = detail;
          }
          if (typeof (detail) == 'object') {
            this.organizations = detail;
            this.oragnisationValidation = null;
          }
        });
    
      
      }
    
      getAllOrganizations() {
       
        this.profileSvc.getOrganizationDetail("initiall").subscribe(detail => {
         
          if (typeof (detail) == 'string') {
    
          }
          if (typeof (detail) == 'object') {
            this.organizations = detail
          }
        })
      }
   


    ngOnDestroy() {
        if (this.crewSub) {
            this.crewSub.unsubscribe();
        }

        if (this.citiesSub) {
            this.citiesSub.unsubscribe();
        }

        if (this.saveSub) {
            this.saveSub.unsubscribe();
        }

        if (this.getSub) {
            this.getSub.unsubscribe();
        }
    }

    personalSave(form) {
        this.submitted = true;
        this.showSaveErrored = false;

        if (!form.valid) return;

        this.saveSub = this.profileSvc
            .savePersonalSettings(this.model)
            .first()
            .subscribe(r => {
                this.onSaveSuccess();
            },
                e => this.onSaveError(e));
    }

    portfolioSave(form) {
        this.submitted = true;
        this.showSaveErrored = false;

        if (!form.valid) {
            return;
        }

        if (this.fuGear.files.length > 0) {
            this.fuGear.upload();
        }

        if (this.fuResume.files.length > 0) {
            this.fuResume.upload();
        }

        this.saveSub = this.profileSvc
            .savePortfolioSettings(this.model)
            .first()
            .subscribe(r => {
                this.onSaveSuccess();
            },
                e => this.onSaveError(e));
    }

    setState() {
        const abbv = this.model.state;
        const selectedState = this.states.filter(f => f.abbreviation == abbv).map(r => r.name + ` (${r.abbreviation})`);
        this.model.state = selectedState[0];
    }

    onProfilePicClicked(event) {
        this.proPicSvc.showDialog(ProfilePicDialogMode.ExistingProfile);
    }

    onBeforeSend(event) {
        if (event.xhr) {
            event.xhr.setRequestHeader('Authorization', this.authSvc.bearer);
        }
    }

    onPdfUploaded(event) {
        const xhr = event.xhr as XMLHttpRequest;

        if (xhr != null && xhr.status == 200) {
            const resp = JSON.parse(xhr.response) as ISiteApiResponse;
            const data = resp.data as PdfUploadResponse;
            this.model.resume = data.fileName;

            if (!resp.error && !data.error) {
                this.onSaveSuccess();
            }
            else {
                this.onSaveError();
            }
        }
        else {
            this.onSaveError();
        }
    }

    showFormInvalid(form) {
        return this.submitted && form.invalid && !this.showSaveErrored;
    }

    onCrewRolesKeyDown(event) {
        if (this.model.crewRoles && this.model.crewRoles.length >= constants.roles.maxRoles) return [];

        const query = (event.query || "").toLocaleLowerCase();

        this.crewRoleSuggestions = this.allCrewRoles
            .filter(f => f.label.toLocaleLowerCase().indexOf(query) != -1)
            .map(r => r.label);
    }

    onCitiesKeyDown(event) {
        if (this.model.profileCities && this.model.profileCities.length >= constants.cities.maxcities) return [];

        const query = (event.query || "").toLocaleLowerCase();
        this.allCitiesSuggestions = this.AllCities
            .filter(f => f.label.toLocaleLowerCase().indexOf(query) != -1)
            .map(r => r.label)
            .slice(0, 20);
    }

    onStateTypeKeyDown(event) {
        const query = (event.query || "").toLocaleLowerCase();

        this.allStateTypeSuggestions = this.states
            .filter(f => f.name.toLocaleLowerCase().indexOf(query) != -1)
            .map(r => r.name + ' (' + r.abbreviation + ')');
    }

    onGenderTypeKeyDown(event) {
        const query = (event.query || "").toLocaleLowerCase();

        this.allGenderTypeSuggestions = this.genders
            .filter(f => f.name.toLocaleLowerCase().indexOf(query) != -1)
            .map(r => r.name);
    }

    onStatusChanged() {
        this.profileSvc.updateStatus(this.model.profileStatus).subscribe(r => { }, e => this.onSaveError(e));
    }

    onBudgetsKeyDown(event) {
        const query = (event.query || "").toLocaleLowerCase();
        this.allBudgetSuggestions = this.AllBudgets
            .filter(f => f.label.toLocaleLowerCase().indexOf(query) != -1)
            .map(r => r.label);
    }

    onUnionTypeKeyDown(event) {
        const query = (event.query || "").toLocaleLowerCase();

        this.allUnionTypeSuggestions = this.unionTypes
            .filter(f => f.label.toLocaleLowerCase().indexOf(query) != -1)
            .map(r => r.label);
    }

    private setGenders() {
        for (let g of this.lookupSvc.getGenders()) {
            this.genders.push({ name: g, value: g });
        }
    }


    private setBudgetList() {
        let matchingIndex: number;
        this.budgetLevel = new BudgetLevels(this.model.reviewsCount, this.model.projectsCount, this.model.biography);
        this.lookupSvc.getBudgetKeys().forEach((item, index) => {
            let requirements;
            switch (Budgets[item]) {
                case Budgets.UltraLowBudget:
                    requirements = this.budgetLevel.ultraLowBudgetText;
                    break;
                case Budgets.LowBudget:
                    requirements = this.budgetLevel.lowBudgetText;
                    break;
                case Budgets.IndustryScale:
                    requirements = this.budgetLevel.industryScaleBudgetText;
                    break;
                case Budgets.UnionRates:
                    requirements = this.budgetLevel.unionRateBudgetText;
                    break;
            }
            if (Budgets[item] == this.model.defaultBudget) {
                matchingIndex = index;
            }
            if ((index > matchingIndex || this.model.defaultBudget == Budgets.InvisibleToPublic) && requirements != '') {
                this.budgetLevelList.push({ label: Budgets[item] + ` (${requirements})`, value: item, name: Budgets[item], disabled: true });
            }
            else {
                this.budgetLevelList.push({ label: Budgets[item], value: item, name: Budgets[item] });
            }
        });
    }

    private onBuildModel(page: ProfileSettingsPage) {
        ProfileSettingsPage.SetReelUrl(page);

        this.model = null;
        this.model = page;
        this.profileUrl = environment.site.profile(this.model.profileSysId);

        if (!this.model.unionTypeId) {
            this.model.unionTypeId = 1;
        }
        if (this.model.personalWebSite)
            this.model.personalWebSite = this.model.personalWebSite.replace(/(^\w+:|^)\/\//, '');
    }

    private onSaveSuccess() {
        this.showSaveErrored = false;
        this.errors = [];

        if (this.notificationSvc) {
            this.notificationSvc.success("Success", "Your settings have been updated.");
        }
        this.router.navigateByUrl('/profile/' + this.model.profileSysId);
    }

    private onSaveError(error = null) {
        if (typeof (error) === "string") {
            this.errors.push(error);
        } else {
            if (error) {
                this.errors = this.respUtils.getErrors(error);
            }
        }

        this.showSaveErrored = true;
    }


    delete(orgPassCode:string)
    {
     
        let message = "Are you sure you want to delete this organization?";
        this.confirmAcceptLabel = "Yes";
        let rejectVisible = true;

        this.confirmSvc.confirm({
          message,
          header: "Delete Organization",
          rejectVisible,
          accept: () => {
            this.profileSvc.deleteOrganization(orgPassCode).subscribe(detail => {            
             this.organizations=detail;
            })
                      
          }
        });
      
  }
  enbTn() {
    this.enableDelete = false;
  }
  desbTn() {
    this.enableDelete = true;
  }

}