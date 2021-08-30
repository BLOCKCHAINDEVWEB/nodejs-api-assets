# nodejs-api-assets  
# Get Started  
Clone code:  
```bash
git clone https://github.com/smartness-mirror/ko-nft-poc.git
cd ko-nft-poc
```

Duplicate the .env file given as an example:  
```bash
cp .env.sample .env npm run build
```

Complete your .env file with:
1. private key from an Pinata API:  
```text
PINATA_KEY=7d7e3c...
```

2. secret key from an Pinata API:   
```text
PINATA_SECRET=cd8123ee3649aec...
```

Duplicate private and secret key Pinata to queries files ipfs.http  
Rename by :  
  <PINATA_KEY>    -> 7d7e3c..  
  <PINATA_SECRET> -> cd8123ee3649aec...  

3. started server APi and open browser with localhost:3002 url :  
```bash
npm run dev  
```

4. prerequisite for queries endpoints files .http  
download api plugins marketplace for Visual Studio Code  
  REST Client by Huachao Mao  
  https://marketplace.visualstudio.com/items?itemName=humao.rest-client  

5. open queries endpoints files ipfs.http and push send Request:  

**Methods**   **Urls**                      **Actions**  

POST      /api/users/userDataJPG      Réalise le backend des metadatas utilisateur  

POST      /api/users/userDatasMP4     Réalise le backend des metadatas utilisateur  

POST      /api/ipfs/pinFilePinata     Epingler le fichier image dans Pinata  

POST      /api/ipfs/pinJsonPinata     Epingler le hash du fichier json dans Pinata  

POST      /api/ipfs/pinHashPinata     Epingle le hash des metadatas dans Pinata  

POST      /api/ipfs/ipfsText          Réalise un dossier de plusieurs NFT type texte  

POST      /api/ipfs/ipfsMedia         Réalise un dossier de plusieurs NFT type média  

POST      /api/ipfs/ipfsRead          Réalise une lecture de fichier depuis un dossier ipfs  

POST      /api/ipfs/ipfsDemo          Réalise un dossier d'un échantillons de fichier de type divers  

GET       /api/posts                  Obtient les renseignements utilisateurs  

GET       /api/posts/1                Obtient les renseignements de l'utilisateur 1  

POST      /api/posts                  Poster les renseignements d'un utilisateur  

PUT       /api/posts/1                Mettre à jour les renseignement de l'utilisateur 1  

DELETE    /api/posts/1                Supprimer les renseignements de l'utilisateur 1  

6. static files used in requests for Rest API endpoints:

**Fichiers statiques:**  

http://localhost:3002/img/Orientation_512x512.jpg  

http://localhost:3002/video/yoga.mp4  

http://localhost:3002/son/0564.mp3  

http://localhost:3002/svg-img/circle.svg  

http://localhost:3002/text/file1.txt  

[https://lasonotheque.org/UPLOAD/mp3/0564.mp3](https://lasonotheque.org/UPLOAD/mp3/0564.mp3)  


7. documentations:  

PINATA                        https://www.pinata.cloud/  

PINATA-SDK                    https://github.com/PinataCloud/Pinata-SDK#pinJSONToIPFS-anchor  

IPFS                          https://docs.ipfs.io/  

ipfs-http-client              https://www.npmjs.com/package/ipfs-http-client  

REST Client by Huachao Mao    https://marketplace.visualstudio.com/items?itemName=humao.rest-client  
