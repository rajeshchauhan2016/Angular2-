import { Component, OnInit } from '@angular/core';
import { ModalService } from '../shared/services/modalService.service';
import { AddSkillsDialogComponent } from '../shared/dialogs/add-skills-dialog/add-skills-dialog.component';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CategorySearchService } from '../services/category-search.service';
import { noop, Observable, Observer, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'signup-skills',
  templateUrl: './signup-skills.component.html',
  styleUrls: ['./signup-skills.component.scss']
})
export class SignupSkillsComponent implements OnInit {
  headerEnable: boolean = false;
  descriptionEnable: boolean = false;
  modalRef: NgbModalRef;
  selectedSkill: any;
  addSkillsForm: FormGroup;
  total: number = 0;
  h_rate: number = 5.0;
  minRate: number = 3;
  minHour: number = 1;
  selectedExperience: any;
  infoValue = '';
  maxTextLength = 5000;
  editDeleteSkill: boolean = false;
  experience: any[] = [
    {
      label: 'Yes',
      value: 'yes'
    },
    {
      label: 'No',
      value: 'no'
    }
  ];
  skills: any[] = [];
  skillPlaceHolder: string = 'Cleaning';
  skillSelected: any;
  skillsList$: Observable<string[]>;
  skillsList: string[] = [];
  userSkillsCategories: any[] = [];
  search: any;
  errorInSkill: boolean;
  skillsSearch: any;
  defaultDescription: string = 'Write short description about you and your skills';
  defaultRate: number = 10;
  defaultExp: number = 1;

  constructor(
    private router: Router,
    private categorySvc: CategorySearchService,
    private modalService: ModalService,
    private formBuilder: FormBuilder,
    private authSvc: AuthService
  ) {
    this.getSkillsData();
    this.setUpSkillsObservable();

    router.events.subscribe((val: NavigationEnd) => {
      if (val.url == '/profile/signup-skills') {
        this.headerEnable = true;
        this.descriptionEnable = true;
      } else {
        this.headerEnable = false;
        this.taskinaJoiningEnable = false;
        this.descriptionEnable = false;
      }
    });
  }

  ngOnInit() {
    this.calculateRowTotal();
    this.createForm();
  }

  setUpSkillsObservable() {
    this.skillsList$ = new Observable((observer: Observer<string>) => {
      observer.next(this.addSkillsForm.value.skillTitle);
    }).pipe(
      switchMap((query: string) => {
        if (query) {
          return this.categorySvc.getSignupSkills(query).pipe(
            map((data: any) => {
              this.skillsList = [];
              let skillsData = [];
              data.result.forEach((item, i) => {
                if (!this.userSkillsCategories.includes(item.id)) {
                  skillsData.push(item);
                }
              });
              this.skillsList = skillsData || [];
              return skillsData || [];
            }),
            tap(
              () => noop(),
              err => {
                console.error(err);
              }
            )
          );
        }
        return of([]);
      })
    );
  }

  skillChanged(event) {
    console.log(event);
  }

  skillSelect(value) {
    if (value && this.skillsList.length > 0) {
      this.skillSelected = value;

      this.skillsSearch = [
        {
          id: this.skillSelected.item.id,
          name: this.skillSelected.item.name,
          placeholder: this.defaultDescription,
          description: '',
          experience: this.defaultExp,
          rate: {
            rates: this.defaultRate
          },
          editable: true
        }
      ];
    }

    this.addSkillsForm.controls.skillTitle.reset();
    console.log('added skills');
  }

  createForm() {
    this.addSkillsForm = this.formBuilder.group({
      skillTitle: new FormControl(''),
      description: new FormControl('', [Validators.required]),
      hourRate: new FormControl('10', [Validators.required]),
      experience: new FormControl('1', [Validators.required])
    });
  }

  getSkillsData() {
    let userId = this.authSvc.userId;
    this.categorySvc.getSkills(userId).subscribe(res => {
      this.skillsList = [];
      this.userSkillsCategories = [];
      if (res.result) {
        res.result.map(skill => {
          this.userSkillsCategories.push(skill.category.id);
          this.editDeleteSkill = true;
          this.skills.push({
            experience: skill.experience,
            mainId: skill.id,
            id: skill.category.id,
            name: skill.category.name,
            description: skill.pitch,
            rate: {
              rates: skill.rate
            },
            editable: false
          });
        });
      }
    });
  }

  calculateRowTotal() {
    this.total = this.h_rate - (this.h_rate * this.taskinaFees) / 100;
  }

  decreementRateValue() {
    this.h_rate > this.minRate ? (this.h_rate -= 1) : (this.h_rate = 3);
    this.calculateRowTotal();
  }

  increementRateValue() {
    this.h_rate += 1;
    this.calculateRowTotal();
  }

  openAddSkillDialog() {
    this.modalRef = this.modalService.openModal(AddSkillsDialogComponent);
  }

  onSubmit() {
    const skillObj = this.skillsList.filter((skill: any) => (skill.name = this.addSkillsForm.value.skillTitle));
    if (this.addSkillsForm.invalid || skillObj.length === 0) {
      this.errorInSkill = true;
      return;
    }

    this.errorInSkill = false;

    let skillTitle = skillObj[0]['id'];
    let hourRate = this.addSkillsForm.value.hourRate;
    let description = this.addSkillsForm.value.description;
    let experience = this.addSkillsForm.value.experience;

    this.addSkills(skillTitle, hourRate, description, experience);
  }

  addSkills(skillTitle, hourRate?, description?, experience?) {
    this.categorySvc
      .addSignupSkills(
        skillTitle,
        (hourRate = this.defaultRate),
        this.defaultDescription,
        (experience = this.defaultExp)
      )
      .subscribe(
        r => {
          this.skills.push({
            name: r.category.name,
            description: r.pitch,
            rate: {
              rates: r.rate
            }
          });
        },
        error => {
          const validationErrors = error.error.errors;
          // this.error = validationErrors[0];
        }
      );
  }

  onCancel() {
    this.addSkillsForm.reset();
  }

  onFinalSubmit() {
    if (this.addSkillsForm.invalid) {
      return;
    }

    const userRequest = { form: this.addSkillsForm.value };
    this.taskinaAuth.updateAboutMe(userRequest).subscribe(
      res => {
        this.router.navigate(['/browse-tasks']);
      },
      err => {
        console.log(err);
      }
    );
  }
}
