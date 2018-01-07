AWS.config.update({
    "accessKeyId": config.MY_KEY,
    "secretAccessKey": config.SECRET_KEY,
    "region": "us-east-1"
});
var s3 = new AWS.S3();      
var fileChooser = document.getElementById('file-chooser');
var button = document.getElementById('upload-button');
var results = document.getElementById('results');

$('#uploadPic').on('change', 'input[type="file"]', function(e) {
    var name = $('#name').val();
    var file = e.target.files[0];
    var fileName = e.target.files[0].name;
    var reader = new FileReader();
    reader.onloadend = function() {
    }

    var data = {Bucket: 'pennbook-my-images',
                Key: name,        
                ContentType: file.type,
                Body: file,
                ACL: 'public-read'};
    s3.putObject(data, function(err, data) {
      console.log('putting object in ' + name);
      if(err) {
        console.log(err);
      } else {
        var urlParams = {Bucket: 'pennbook-my-images', Key: name};
        s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
            socket.emit('url', url);
        });           
        console.log(data);
      }
    });     
});         

button.addEventListener('click', function () {
    var file = fileChooser.files[0];

    if (file) {            
        var params = {
            Bucket: 'pennbook-my-images',
            Key: file.name, //file.name,
            ContentType: file.type,
            Body: file,
            ACL: 'public-read'
        };        
        s3.putObject(params, function (err, res) {
            if (err) {
                results.innerHTML = ("Error uploading data: ", err);
            } else {
                results.innerHTML = ("Successfully uploaded data");

                document.getElementById("myLink").src= "https://s3.amazonaws.com/pennbook-my-images/"+file.name.split(' ').join('+');
                document.getElementById("myPicURL").value= "https://s3.amazonaws.com/pennbook-my-images/"+file.name.split(' ').join('+');

                var rekognition = new AWS.Rekognition();

                var searchParams = {
                    Image: {'S3Object':{'Bucket':'pennbook-my-images','Name':file.name}}
                }

                rekognition.detectLabels(searchParams, function (err, data) {
                    if (err) {
                        console.log(err, err.stack); // an error occurred
                    } else { 
                        console.log(data.Labels);
                    }
                });
            }
        });

    } else {
        results.innerHTML = 'Nothing to upload.';
    }
}, false);