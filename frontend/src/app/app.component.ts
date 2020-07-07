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
