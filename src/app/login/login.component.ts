import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('loginRef', {static: true }) loginElement: ElementRef;

  auth2:any
  res:any;
  showAlert=false
  validateUser = new FormGroup({
    password:new FormControl('', Validators.required),
    email:new FormControl('',Validators.required)

  })

  constructor(private userService:DataService,private router:Router,private route: ActivatedRoute , private ngZone:NgZone) { }

  ngOnInit(): void {
    this.fbLibrary();
    this.googleSDK();
    this.res= this.route.snapshot.paramMap.get('res')

    if(this.res=="the email is already registered"){
      this.showAlert=false
    }
    else{
      this.showAlert=true
    }

  }


  fbLibrary() {

    (window as any).fbAsyncInit = function() {
      window['FB'].init({
        appId      : '3094231864035840',
        cookie     : true,
        xfbml      : true,
        version    : 'v3.1'
      });
      window['FB'].AppEvents.logPageView();
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));

}


googleSDK() {

  window['googleSDKLoaded'] = () => {
    window['gapi'].load('auth2', () => {
      this.auth2 = window['gapi'].auth2.init({
        client_id: '209777883139-effihbo4e4lgf7rs3g59thfcnuljt56o.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        scope: 'profile email'
      });
      this.prepareLoginButton();
    });
  }

  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://apis.google.com/js/platform.js?onload=googleSDKLoaded";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'google-jssdk'));

}



  login() {

    window['FB'].login((response) => {
        console.log('login response',response);
        if (response.authResponse) {

          window['FB'].api('/me', {
            fields: 'last_name, first_name, email'
          }, (userInfo) => {

            console.log("user information");
            console.log(userInfo);
            this.ngZone.run(()=>this.router.navigate(['/home',userInfo]));  

          });

        } else {
          console.log('User login failed');
        }
    }, {scope: 'email'});
}


prepareLoginButton() {

  this.auth2.attachClickHandler(this.loginElement.nativeElement, {},
    (googleUser) => {

      let profile = googleUser.getBasicProfile();
      console.log('Token || ' + googleUser.getAuthResponse().id_token);
      console.log('ID: ' + profile.getId());
      console.log('Name: ' + profile.getName());
      console.log('Image URL: ' + profile.getImageUrl());
      console.log('Email: ' + profile.getEmail());
      //YOUR CODE HERE
      this.ngZone.run(()=>this.router.navigate(['/home',{name:profile.getName()}]));  



    }, (error) => {
      alert(JSON.stringify(error, undefined, 2));
    });

}




loginUser(){
  this.userService.validateUser(this.validateUser.value).subscribe(
    res=>{
      console.log(res)
      if(res=="Invalid Details")
      {
        this.showAlert=true
      }
      else{      this.router.navigate(['/home',{res:res}]);  
    }

    },
    error=>{console.log(error)}
  )
  console.log(this.validateUser.value)
}

}
