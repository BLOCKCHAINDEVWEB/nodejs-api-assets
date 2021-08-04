# POST
curl --data "name=Elaine&email=elaine@example.com" 
http://localhost:3000/users

# PUT
curl -X PUT -d "name=Kramer" -d "email=kramer@example.com" 
http://localhost:3000/users/1

# DELETE
curl -X "DELETE" http://localhost:3000/users/1

```html
<video id="videoPlayer" controls>
  <source src="http://localhost:3000/video" type="video/mp4">
</video>
```
