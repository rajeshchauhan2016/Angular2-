import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ProfileStatusTypes } from 'shared/services/ProfileStatusTypes';
import { Observable } from 'rxjs/Observable';
import {BudgetDetails } from '../shared/dialogs/budget-level/models'
import {
    ProfilePage,
    PagerRequest,
    CardResponse,
    ProjectCardResponse,
    ReviewCard,
    ReviewsOnOverview,
    ProfileHistoryResponse,
} from './models';

import {
    UpdateProfileSettingsRequest,
    ProfileSettingsPage,
    ChangePasswordRequest,
    UpdatePortfolio,
    UpdatePersonalInfo,
    Organizations
    
} from './settings/models';

import {
    CompanyUpdateProfileSettingsRequest,
    CompanyProfileSettingsPage,
    CompanyUpdatePortfolio,
    CompanyUpdatePersonalInfo
    
} from './settings-company/models';

import { ISiteApiResponse, SiteApiResponseUtilities } from 'shared/services/SiteApiResponse';
import * as httputils from 'shared/angular/http';
import { environment } from 'environments/environment';

import 'rxjs/add/operator/catch';
import { ReviewRequest } from 'shared/dialogs/review-request/models';

@Injectable()
export class ProfileService {
    private respUtils = new SiteApiResponseUtilities();

    constructor (
        private http: HttpClient
    ) { }

    getProjects(profileSysId: string, request: PagerRequest): Observable<CardResponse<ProjectCardResponse>> {
        const url = environment.endpoints.profile.freelancer.projects(profileSysId);
        const params = httputils.toHttpParams(request);

        return this.http
            .get<ISiteApiResponse>(url, { params })
            .map(r => this.onGetSuccessful(r));
    }

    deleteProject(id: number): Observable<boolean> {
        const url = environment.endpoints.profile.freelancer.deleteProject(id);

        return this.http
            .post(url, {})
            .map(r => true);
    }

    addToFavorite(id: number): Observable<boolean> {
        const url = environment.endpoints.profile.freelancer.favoriteProject(id);

        return this.http
            .post(url, {})
            .map(r => true);
    }

    removeFromFavorite(id: number): Observable<boolean> {
        const url = environment.endpoints.profile.freelancer.unfavoriteProject(id);

        return this.http
            .post(url, {})
            .map(r => true);
    }
  
    getReviews(profileSysId: string, request: PagerRequest): Observable<CardResponse<ReviewCard>> {
        const url = environment.endpoints.profile.freelancer.reviews(profileSysId);
        const params = httputils.toHttpParams(request);

        return this.http
            .get<ISiteApiResponse>(url, { params })
            .map(r => this.onGetSuccessful(r));
    }

    getReviewRequests(): Observable<ReviewRequest[]> {
        const url = environment.endpoints.profile.freelancer.reviewRequests;

        return this.http
            .get<ISiteApiResponse>(url)
            .map(r => this.onGetSuccessful(r));
    }

    deleteReviewRequest(id: number) {
        const url = environment.endpoints.profile.freelancer.deleteReviewRequest(id);
        return this.http
            .post(url, {})
            .map(r => true);
    }

    validateResendReviewRequest(id: number){
        const url = environment.endpoints.profile.freelancer.validateResendReviewRequest(id);
        return  this.http
            .get<ISiteApiResponse>(url)
            .map(r => this.onGetSuccessful(r));
    }

    resendReviewRequest(id: number) {
        const url = environment.endpoints.profile.freelancer.resendReviewRequest(id);
        return this.http
            .post(url, {})
            .map(r => true);
    }
    
    getProfile(profileSysId: string, reviewCount: number = ReviewsOnOverview): Observable<ProfilePage> {
        const url = environment.endpoints.profile.freelancer.profile(profileSysId);
        const params = httputils.toHttpParams({ reviewCount });

        return this.http
            .get<ISiteApiResponse>(url, { params })
            .map(r => this.onGetSuccessful(r));
    }

    getSettings(): Observable<ProfileSettingsPage> {
        const url = environment.endpoints.profile.freelancer.settings;

        return this.http
            .get<ISiteApiResponse>(url)
            .map(r => this.onGetSuccessful(r));
    }

    getCompanySettings(): Observable<CompanyProfileSettingsPage> {
        const url = environment.endpoints.profile.freelancer.settings;

        return this.http
            .get<ISiteApiResponse>(url)
            .map(r => this.onGetSuccessful(r));
    }

    savePersonalSettings(settings: UpdateProfileSettingsRequest) {
        const url = environment.endpoints.profile.freelancer.personalSetting;
        return this.http
            .post(url, settings)
            .map(r => true)
            .catch(e => this.respUtils.onServiceError(e));
    }

    saveCompanyPersonalSettings(settings: CompanyUpdateProfileSettingsRequest) {
        const url = environment.endpoints.profile.freelancer.companyPersonalSetting;

        return this.http
            .post(url, settings)
            .map(r => true)
            .catch(e => this.respUtils.onServiceError(e));
    }
    
    savePortfolioSettings(settings: UpdateProfileSettingsRequest) {
        const url = environment.endpoints.profile.freelancer.portfolioSettings;
      
        return this.http
            .post(url, settings)
            .map(r => true)
            .catch(e => this.respUtils.onServiceError(e));
    }
    
    saveCompanyPortfolioSettings(settings: CompanyUpdateProfileSettingsRequest) {
        const url = environment.endpoints.profile.freelancer.companyPortfolioSettings;
      
        return this.http
            .post(url, settings)
            .map(r => true)
            .catch(e => this.respUtils.onServiceError(e));
    }

    uploadProfilePicture(image: any) {
        const url = environment.endpoints.upload.profileImage;

        const params = new HttpParams()
            .set("payload", image);

        const headers = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        return this.http
            .post<ISiteApiResponse>(url, params, { headers })
            .map(r => this.onGetSuccessful(r));
    }

    changePassword(request: ChangePasswordRequest) {
        const url = environment.endpoints.profile.freelancer.changePassword;

        return this.http
            .post(url, request)
            .map(r => true);
    }

    updateStatus(status: ProfileStatusTypes) {
        const url = environment.endpoints.profile.freelancer.updateStatus(status);

        return this.http
            .get(url)
            .map(r => true)
            .catch(e => this.respUtils.onServiceError(e));
    }

    getHistory(profileSysId: string, request: PagerRequest): Observable<ProfileHistoryResponse> {
        const url = environment.endpoints.profile.freelancer.history(profileSysId);
        const params = httputils.toHttpParams(request);

        return this.http
            .get<ISiteApiResponse>(url, { params })
            .map(r => this.onGetSuccessful(r));
    }

    private onGetSuccessful(response: ISiteApiResponse) {
        return response.data || null;
    }


    private onGetOrganizations(response: any[]) {
        return response as Organizations[]  || null;
      }
    
      getOrganizationDetail(orgPassCode: string) {
        const url = environment.endpoints.profile.freelancer.organizationDetail(orgPassCode);
        return this.http
          .get<any>(url, {})
          .map(r => this.onGetOrganizations(r));
      }
    
      getOnlyOrganizationDetail(orgPassCode:string)
      {
        const url = environment.endpoints.profile.freelancer.onlyOrganizationDetail(orgPassCode);
        return this.http
          .get<any>(url, {})
          .map(r => this.onGetOrganizations(r));
      }
    
    
      deleteOrganization(passCode: string) {
        const url = environment.endpoints.profile.freelancer.deleteOrganization(passCode);
        return this.http
          .get<any>(url,{})
          .map(r => r);
      }

}