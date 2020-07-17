import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskinaSignupSkillsComponent } from './taskina-signup-skills.component';

describe('TaskinaSignupSkillsComponent', () => {
  let component: TaskinaSignupSkillsComponent;
  let fixture: ComponentFixture<TaskinaSignupSkillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaskinaSignupSkillsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskinaSignupSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
