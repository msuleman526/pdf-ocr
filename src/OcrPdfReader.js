import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { createWorker } from 'tesseract.js';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const OcrPdfReader = () => {
 
  let [totalImages, setTotalImages] = useState([])   
  useEffect(() => {
    handleTextExtraction()
  }, [])

  const handleTextExtraction = async () => {
        try {
            fetch("demo1.pdf").then((response) => {
                response.blob().then((blob) => {
                  console.log(blob)
                  let reader = new FileReader();
                  reader.onload = (e) => {
                    const data = atob(e.target.result.replace(/.*base64,/, ""));
                    renderPage(data);
                  };
                  reader.readAsDataURL(blob);
                });
            });
        } catch (error) {
            console.error('Error during text extraction:', error);
        }
    };

    const renderPage = async (data) => {
        const imagesList = [];
        const canvas = document.createElement("canvas");
        canvas.setAttribute("className", "canv");
        const pdf = await pdfjs.getDocument({ data }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          var page = await pdf.getPage(i);
          var viewport = page.getViewport({ scale: 3.0 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          var render_context = {
            canvasContext: canvas.getContext("2d"),
            viewport: viewport,
          };
          await page.render(render_context).promise;
          let img = canvas.toDataURL("image/png");
          imagesList.push(img);
      }
      setTotalImages(imagesList)
      console.log("Total Pages -> ", imagesList.length)
   };

   let handleOCR = async () => {
     const worker = await createWorker()
     const {data} = await worker.recognize(totalImages[0])
     console.log(data)
     analyzeTextBlocks(data)
   }


  let analyzeTextBlocks = (text) => {
     let lines = text.lines
     //Name
     let name = lines[1].text
     name = name.replace("\n", "")
     name = name.replace(". ", "")
     name = name.replace("* ", "")

     //Address and Date
     let addressData1 = lines[2].text.replace("national grid", "").replace("national rid", "").replace("national r [ d", "")
     let dateTxt = dateContains(addressData1)
     let addressAndDate = addressData1.split(" "+dateTxt);
     let address = addressAndDate[0].replace(". ", "").replace("* ", "").replace("\n", "").replace("A", "")
     let date =  dateTxt+addressAndDate[1].replace(". ", "").replace("* ", "").replace("\n", "").replace("A", "")
     let address2 = lines[3].text.replace(" ACCOUNT NUMBER\n", "")
     address = address + " " + address2

    //Account Number, Please pay By and Amount Due
    let data = lines[4].text
    data = data.split(" ")

    let accountNo = data[0].replace(". ", "").replace("* ", "").replace("\n", "").replace("A", "")
    let pleasePayBy = ""
    for(let j=1;j<data.length-1;j++){
        pleasePayBy = pleasePayBy + " " + data[j]
    }
    let amountDue = data[data.length-1].replace(". ", "").replace("* ", "").replace("\n", "").replace("A", "")

    //Customer Service
    let customerService = lines[8].text.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", "")
    
    //Account Balance
    //Previous Balance
    data = lines[9].text.split("Previous Balance")
    let previousBalance = data[1]

    //Payment Recieved and Credit Department
    data = lines[10].text.split(" ")
    let creditDepartment = data[0]
    let paymentReceived = data[data.length-1]

    //Gas Emergencies and Balance forward
    data = lines[12].text.split(" ")
    let gasEmercengies = data[0]
    let balanceForwards = data[data.length-1]

    //Current Charges
    data = lines[14].text.split(" ")
    let currentCharges = data[data.length-1]

    //Credit Balance
    data = lines[15].text.split(" ")
    let creditBalance = data[data.length-1]

    //Electric Service
    let electricService = lines[24].text.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", "")

    //Other Charges
    let otherCharges = lines[25].text.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", "")

    //Delivery Total, Supply Total, Other Charges Total, Total
    data = lines[26].text.replace("Total Current Charges ", "").replace("$ ", "$")
    data = data.replace("$ ", "$").split(" ")
    let deliveryTotal = data[data.length-4]
    let supplyToal = data[data.length-3]
    let otherTotal = data[data.length-2]
    let total = data[data.length-1]

    let obj = {
        "name": name,
        "date": date, 
        "address": address, 
        "accountNo": accountNo,
        "pleasePayBy": pleasePayBy,
        "amountDue": amountDue.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "customerService": customerService, 
        "creditDepartment": creditDepartment,
        "gasEmergencies": gasEmercengies,
        "previousBalance": previousBalance?.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "paymentRecieved": paymentReceived?.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "balanceForward": balanceForwards?.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "currentCharges": currentCharges?.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "electricService": electricService,
        "otherCharges": otherCharges?.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "creditBalance": creditBalance?.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "deliveryTotal": deliveryTotal?.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "supplyToal": supplyToal?.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "otherTotal": otherTotal?.replace(". ", "").replace("* ", "").replace("\n", "").replace("A", ""),
        "total": total,
    }

    console.log(obj)
    
  }

  let dateContains = (txt) => {
     if(txt.includes("Jan")) return "Jan"
     else if(txt.includes("Jan")) return "Jan"
     else if(txt.includes("Feb")) return "Feb"
     else if(txt.includes("Mar")) return "Mar"
     else if(txt.includes("Apr")) return "Apr"
     else if(txt.includes("May")) return "May"
     else if(txt.includes("Jun")) return "Jun"
     else if(txt.includes("Jul")) return "Jul"
     else if(txt.includes("Aug")) return "Aug"
     else if(txt.includes("Sep")) return "Sep"
     else if(txt.includes("Oct")) return "Oct"
     else if(txt.includes("Nov")) return "Nov"
     else if(txt.includes("Dec")) return "Dec"
  }

  return (
    <div>
      <button onClick={handleOCR}>Extract Text</button>
    </div>
  );
};

export default OcrPdfReader;
