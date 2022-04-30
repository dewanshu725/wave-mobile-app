import { Component, isDevMode, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { DEV_PROD, ERROR_MESSAGE, REGEX } from 'src/app/helpers/constents';
import { EMAIL_CHECK, RESET_PASSSWORD, SEND_PASSWORD_RESET_OTP_FOR_EMAIL, SEND_PASSWORD_RESET_OTP_FOR_USERNAME, USERNAME_CHECK } from 'src/app/helpers/graphql.query';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GraphqlService } from 'src/app/services/graphql.service';
import { IonicControllerService } from 'src/app/services/ionic-controller.service';
import { Keyboard } from '@capacitor/keyboard';
import {Capacitor} from "@capacitor/core";


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private ionicControllerService: IonicControllerService,
    private authenticationService: AuthenticationService,
    private graphqlService: GraphqlService,
    private title:Title, 
    private meta:Meta
    ) { }

  metaTags:MetaDefinition[] = [
    {name: "title", content: "Login | Wave"}
  ];

  wave_long_logo_url:string;

  removeContent = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  loading = false;
  usernameIdentifier = false;

  accountForm: FormGroup;
  accountInvalid = false;
  accountNotActivated = false;
  accountInvalidCredentials = false;
  otpInvalid = false;
  confirmPasswordHidden = true;

  resetPasswordKey:string = null;


  ngOnInit() {
    this.title.setTitle("Login | Wave");
    this.meta.addTags(this.metaTags);

    if (isDevMode()){
      this.wave_long_logo_url = 'assets/svg/long-logo.svg';
    }
    else{
      this.wave_long_logo_url = DEV_PROD.staticUrl_prod + 'assets/svg/long-logo.svg';
    }

    this.createAccountForm();
  }

  ionViewWillEnter(){
    this.removeContent = false;
  }

  ionViewDidEnter(){
    this.destroy$ = new Subject<boolean>();

    this.accountForm.get('login.username/email').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.accountInvalid = false;
    });

    this.accountForm.get('login.password').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.accountNotActivated = false;
      this.accountInvalidCredentials = false;
    });

    this.accountForm.get('resetPassword.otp').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.otpInvalid = false;
    });
  }

  createAccountForm(){
    this.accountForm = new FormGroup({
      'login': new FormGroup({
        'username/email': new FormControl(null, Validators.required),
        'password': new FormControl(null, Validators.required),
        'keepMeLogined': new FormControl(true, Validators.required),
      }),
      'resetPassword': new FormGroup({
        'otp': new FormControl(null, Validators.required),
        'password': new FormControl(null, [Validators.required, Validators.pattern(REGEX.password_validation.source)]),
        'confirmPassword': new FormControl(null, Validators.required),
      }, {validators: this.passwordMatchValidator})
    });
  }

  passwordMatchValidator(control: AbstractControl): {[key:string]: boolean} | null{
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password.pristine || confirmPassword.pristine){
      return null
    }

    return password && confirmPassword && password.value != confirmPassword.value ? {'misMatch': true} : null;
  }

  async verifyAccount(stepper: MatStepper){
    this.loading = true;

    await this.keyboardAction();

    const accountIdetifier = this.accountForm.get('login.username/email').value.match(/@/g);

    if (accountIdetifier != null){
      if (!REGEX.email_validation.test(this.accountForm.get('login.username/email').value)){
        this.loading = false;
        this.accountInvalid = true;
      }
      else{
        this.graphqlService.graphqlMutation(EMAIL_CHECK, {email: this.accountForm.get('login.username/email').value}).pipe(take(1))
        .subscribe(
          (result:any) => {
            if (result.data?.emailUsernameCheck?.email === false){
              this.loading = false;
              this.usernameIdentifier = false;
              stepper.next();
            }
            else{
              this.loading = false;
              this.accountInvalid = true;
            }
          },
          error => {
            this.loading = false;
            this.accountInvalid = true;
            this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
          }
        );
      }
    }
    else{
      if (!REGEX.username_validation.test(this.accountForm.get('login.username/email').value)){
        this.loading = false;
        this.accountInvalid = true;
      }
      else{
        this.graphqlService.graphqlMutation(USERNAME_CHECK, {username: this.accountForm.get('login.username/email').value}).pipe(take(1))
        .subscribe(
          (result:any) => {
            if (result.data?.emailUsernameCheck?.username === false){
              this.loading = false;
              this.usernameIdentifier = true;
              stepper.next();
            }
            else{
              this.loading = false;
              this.accountInvalid = true;
            }
          },
          error => {
            this.loading = false;
            this.accountInvalid = true;
            this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
          }
        );
      }
    }
  }

  async sendPasswordResetOtp(stepper: MatStepper){
    this.loading = true;

    await this.keyboardAction();

    let QUERY_TYPE;
    let mutationArrgs;

    if (this.usernameIdentifier){
      QUERY_TYPE = SEND_PASSWORD_RESET_OTP_FOR_USERNAME;
      mutationArrgs = {username: this.accountForm.get('login.username/email').value};
    }
    else{
      QUERY_TYPE = SEND_PASSWORD_RESET_OTP_FOR_EMAIL;
      mutationArrgs = {email: this.accountForm.get('login.username/email').value};
    }

    this.graphqlService.graphqlMutation(QUERY_TYPE, mutationArrgs).pipe(take(1))
    .subscribe(
      (result:any) => {
        if (result.data?.sendPasswordResetOtp?.key != null){
          this.resetPasswordKey = result.data.sendPasswordResetOtp.key;
          stepper.next();
        }
        else{
          this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
        }

        this.loading = false;
      },
      error => {
        this.loading = false;
        this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
      }
    );
  }

  async resetPassword(stepper: MatStepper){
    this.loading = true;

    await this.keyboardAction();

    if (this.accountForm.get('resetPassword.otp').value.toString().length > 6){
      this.otpInvalid = true;
      this.loading = false;
    }
    else{
      const mutationArrgs = {
        key: this.resetPasswordKey,
        verificationCode: this.accountForm.get('resetPassword.otp').value,
        password: this.accountForm.get('resetPassword.password').value
      }
  
      this.graphqlService.graphqlMutation(RESET_PASSSWORD, mutationArrgs).pipe(take(1))
      .subscribe(
        (result:any) => {
          if (result.data?.passwordReset?.result === true){
            this.ionicControllerService.simpleToast("Password Changed Successfully");
            stepper.previous();
          }
          else{
            this.otpInvalid = true;
          }
  
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
        }
      );
    }
  }

  async loginFormSubmit(){
    this.loading = true;

    await this.keyboardAction();

    const login = await this.authenticationService.login(
      this.accountForm.get('login.username/email').value,
      this.accountForm.get('login.password').value,
      this.usernameIdentifier,
      this.accountForm.get('login.keepMeLogined').value
    );

    if (login === false){
      await this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
    }
    else{
      if (login === 'not_verified'){
        this.accountNotActivated = true;
      }
      else if (login === 'invalid_credentials'){
        this.accountInvalidCredentials = true;
      }
    }

    this.loading = false;
  }

  async keyboardAction(hide=true){
    if (Capacitor.isNativePlatform()){
      if (hide){
        await Keyboard.hide();
      }
      else{
        await Keyboard.show();
      }
    }
  }


  resetState(){
    this.loading = false;
    this.usernameIdentifier = false;
    this.accountInvalid = false;
    this.accountNotActivated = false;
    this.accountInvalidCredentials = false;
    this.otpInvalid = false;
    this.confirmPasswordHidden = true;
    this.resetPasswordKey = null;
  }

  ionViewDidLeave(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.resetState();
    this.removeContent = true;
    this.createAccountForm();
  }

}
