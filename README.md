# Resumable-upload
Multiple ,Resumable , with Drag/Drop and Progress Bar in Angular and Node  



Let's start after seeing this what we gonna make

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/1rzmilqhernhuerp06ao.png)

<hr>
Features : 
- Drag/drop upload 
- Resumable 
- Multiple uploads 
- progress bar 


Let's start now : 

## Step 1 :

### Create project first..

```bash
ng new frontend
``` 
To generate frontend

then...
#### For Backend(Node)

```bash
mkdir backend
cd backend 
npm init -y
```
to create backend of our project

### Structure : 
<h4>
Root: 
<ol>
<li>Frontend
<ul><li>Angular folder structure</li></ul>
</li>
<li>Backend
<ul>
<li>package.json</li>
<li>index.js</li>
<li>name(folder/directory where we will store all the uploaded files)
</li>
</ul>
</li>
</ol>
</h4>

### Note: that <mark>name folder in our backend</mark> is important don't forget to create it or you will get an error in the filestream.

<hr>

## Step 2 :
### Working on our backend first : 

Add this dependecies in your `Backend/package.json` : 

```json
"dependencies": {
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "fs": "0.0.1-security"
  }
```
After adding this dependency to your file use <code>npm i</code> to install them :

In `Backend/index.js` :
```javascript
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(3000, () => {
  console.log("Started in 3000");
});


let uploads = {};

app.post("/upload", (req, res, next) => {
  let fileId = req.headers["x-file-id"];
  let startByte = parseInt(req.headers["x-start-byte"], 10);
  let name = req.headers["name"];
  let fileSize = parseInt(req.headers["size"], 10);
  console.log("file Size", fileSize, fileId, startByte);
  if (uploads[fileId] && fileSize == uploads[fileId].bytesReceived) {
    res.end();
    return;
  }

  console.log(fileSize);

  if (!fileId) {
    res.writeHead(400, "No file id");
    res.end(400);
  }
  console.log(uploads[fileId]);
  if (!uploads[fileId]) uploads[fileId] = {};

  let upload = uploads[fileId];

  let fileStream;

  if (!startByte) {
    upload.bytesReceived = 0;
    let name = req.headers["name"];
    fileStream = fs.createWriteStream(`./name/${name}`, {
      flags: "w",
    });
  } else {
    if (upload.bytesReceived != startByte) {
      res.writeHead(400, "Wrong start byte");
      res.end(upload.bytesReceived);
      return;
    }
    // append to existing file
    fileStream = fs.createWriteStream(`./name/${name}`, {
      flags: "a",
    });
  }

  req.on("data", function (data) {
    //console.log("bytes received", upload.bytesReceived);
    upload.bytesReceived += data.length;
  });

  console.log("-------------------------------------------");


  //req is a readable stream so read from it 
  //and whatever data we got from reading provide it to 
  // writable stream which is fileStream, so read data from req Stream and then write in fileStream 
  req.pipe(fileStream);


  // when the request is finished, and all its data is written
  fileStream.on("close", function () {
    console.log(upload.bytesReceived, fileSize);
    if (upload.bytesReceived == fileSize) {
      console.log("Upload finished");
      delete uploads[fileId];

      // can do something else with the uploaded file here
      res.send({ status: "uploaded" });
      res.end();
    } else {
      // connection lost, we leave the unfinished file around
      console.log("File unfinished, stopped at " + upload.bytesReceived);
      res.writeHead(500, "Server Error");
      res.end();
    }
  });

  // in case of I/O error - finish the request
  fileStream.on("error", function (err) {
    console.log("fileStream error", err);
    res.writeHead(500, "File error");
    res.end();
  });
});

app.get("/", (req, res) => {
  res.send(
    `<h1 style='text-align: center'>
            <br>Code By <a href="https://github.com/deep1144">Deep<br>
            <b style="font-size: 182px;">😃👻</b>
        </h1>`
  );
});

app.get("/status", (req, res) => {
  //console.log('came');
  let fileId = req.headers["x-file-id"];
  let name = req.headers["name"];
  let fileSize = parseInt(req.headers["size"], 10);
  console.log(name);
  if (name) {
    try {
      let stats = fs.statSync("name/" + name);
      if (stats.isFile()) {
        console.log(
          `fileSize is ${fileSize} and already uploaded file size ${stats.size}`
        );
        if (fileSize == stats.size) {
          res.send({ status: "file is present", uploaded: stats.size });
          return;
        }
        if (!uploads[fileId]) uploads[fileId] = {};
        console.log(uploads[fileId]);
        uploads[fileId]["bytesReceived"] = stats.size;
        console.log(uploads[fileId], stats.size);
      }
    } catch (er) {}
  }
  let upload = uploads[fileId];
  if (upload) res.send({ uploaded: upload.bytesReceived });
  else res.send({ uploaded: 0 });
});
```

with this, we are pretty much done with our backend.

<hr/>
## Step 3 :

Now let's start working on our Frontend:

In `frontend/` run the following command:
```bash
ng add @angular/material
```
To add angular material theme to our project

I have used `pink&blue-gray` in my project


### In `frontend/src/app/app.module.ts` paste the following code :
We are using @angular/material for this project 

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```


<hr/>
## Step 4 :

### In `frontend/src/app/app.component.html` paste the following code :

```html
<div>
  <mat-card>

    <mat-card-header class="mb-3">
      <mat-card-title>File Uploads</mat-card-title>
    </mat-card-header>

    <div id="drag_zone" class="file-upload-wrapper" (drop)="dropFiles($event)" (dragover)='dragOverHandler($event)'>Drag
      your thing here</div>

    <mat-list>
      <mat-list-item *ngFor="let file of this.selectedFiles" [class.upload-sucess]="file.uploadCompleted">
        <mat-icon mat-list-icon>note</mat-icon>
        <div mat-line>{{file.fileName}}</div>

        <mat-progress-bar class="mr-4" mode="determinate" value="{{file.uploadedPercent}}"></mat-progress-bar>

        <div>
          <mat-icon style="cursor: grab;margin-top: 2px;" (click)="deleteFile(file)">delete</mat-icon>
        </div>
        <mat-divider></mat-divider>
      </mat-list-item>
    </mat-list>

    <button (click)="uploadFiles()" class="btn btn-primary mt-3" [disabled]="this.selectedFiles.length <=0"> upload
      Files
    </button>


  </mat-card>
</div>
```

In `frontend/src/app/app.component.css` paste followings: 
```css
#drag_zone{
  width:100%;
  height: 200px;
  margin: auto;
  padding: 8px;
  text-align: center;
  background-color: #f0f0f0;
  border: 2px dashed gray;
  border-radius: 8px;
  color: black;
}
``` 

This is our code for our UI :


<hr/>
## Step 5 :
This is our last step : 

### in `frontend/src/app/app.component.ts` paste the following code :

```typescript
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType } from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';


  selectedFiles = [];

  constructor(private http: HttpClient){}

  dropFiles(ev) {
    // Prevent default behavior(file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          let file = ev.dataTransfer.items[i].getAsFile();
          let obj = {
            fileName: file.name,
            selectedFile: file,
            fileId: `${file.name}-${file.lastModified}`,
            uploadCompleted: false
          }
          this.selectedFiles.push(obj);
          console.log('... file[' + i + '].name = ' + file.name);
        }
      }
      this.selectedFiles.forEach(file => this.getFileUploadStatus(file));
    } else {

      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
      }
    }
  }

  dragOverHandler(ev) {
    console.log('File(s) in drop zone');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    ev.stopPropagation();
  }



  getFileUploadStatus(file){
    // fetch the file status on upload
    let headers = new HttpHeaders({
      "size": file.selectedFile.size.toString(),
      "x-file-id": file.fileId,
      'name': file.fileName
    });

    this.http
      .get("http://localhost:3000/status", { headers: headers }).subscribe(
        (res: any) => {
          file.uploadedBytes = res.uploaded;
          file.uploadedPercent = Math.round(100* file.uploadedBytes/file.selectedFile.size);
          if(file.uploadedPercent >= 100){
            file.uploadCompleted = true;
          }
        },err => {
          console.log(err);
        }
      )
  }

  uploadFiles(){
    this.selectedFiles.forEach(file => {
      if(file.uploadedPercent < 100)
        this.resumeUpload(file);
    })
  }

  resumeUpload(file){
    //make upload call and update the file percentage
    const headers2 = new HttpHeaders({
      "size": file.selectedFile.size.toString(),
      "x-file-id": file.fileId,
      "x-start-byte": file.uploadedBytes.toString(),
      'name': file.fileName
    });
    console.log(file.uploadedBytes, file.selectedFile.size, file.selectedFile.slice(file.uploadedBytes).size);

    const req = new HttpRequest('POST', "http://localhost:3000/upload", file.selectedFile.slice(file.uploadedBytes, file.selectedFile.size + 1),{
           headers: headers2,
          reportProgress: true //this will give us percentage of file uploaded
        });

    this.http.request(req).subscribe(
      (res: any) => {

        if(res.type === HttpEventType.UploadProgress){
          console.log("-----------------------------------------------");
          console.log(res);
          file.uploadedPercent = Math.round(100* (file.uploadedBytes+res.loaded)/res.total);
          // Remember, reportProgress: true  (res.loaded and res.total) are returned by it while upload is in progress


          console.log(file.uploadedPercent);
          if(file.uploadedPercent >= 100){
            file.uploadCompleted = true;
          }
        }else{
          if(file.uploadedPercent >= 100){
            file.uploadCompleted = true;
            this.selectedFiles.splice(this.selectedFiles.indexOf(file), 1);
          }
        }
      },
      err => {
        console.log(err)
      }
    )
  }

  deleteFile(file){
    this.selectedFiles.splice(this.selectedFiles.indexOf(file), 1);
  }
}

```

<hr/>
## Step 6 :

It's time to run our project :

### 1. In `frontend/` run:
```bash
ng serve -o
```

### 2. In `backend/` run:
```bash
npm start
```

to see result : <a href="http://localhost:4200/">http://localhost:4200/</a> 


## Done !!! 

### Notes : 
#### - Read comments for better understanding of code 



