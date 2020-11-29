let btnGetData = document.getElementById("btnGetData");
async function getDate() {
   let response = await fetch('./media/eurostat.json');
   let data = await response.json();
   return data;
}

function drawTable(dataset, anSelectat) {
   let existentTable = document.getElementById("dataTable");
   if (existentTable)
      document.body.removeChild(existentTable);

   let table = document.createElement("table");
   table.setAttribute("id", "dataTable"); //ii dau id ca sa-l pot stiliza in css
   table.classList.add("table");
   //creare header tabel
   let tHead = document.createElement("thead");
   tHead.classList.add("thead-dark");
   tHead.setAttribute("id", "tableHead");
   let rowHead = document.createElement("tr");
   let thTara = document.createElement("th");
   thTara.innerHTML = "Tara";
   let thPIB = document.createElement("th");
   thPIB.innerHTML = "PIB";
   let thSV = document.createElement("th");
   thSV.innerHTML = "Speranta de viata";
   let thPop = document.createElement("th");
   thPop.innerHTML = "Populatie";
   rowHead.appendChild(thTara);
   rowHead.appendChild(thSV);
   rowHead.appendChild(thPIB);
   rowHead.appendChild(thPop);
   tHead.appendChild(rowHead);
   table.appendChild(tHead);
   //creare table body cu date
   let tBody = document.createElement("tbody");
   let tr;
   let tdTara;
   let tdSV;
   let tdPIB;
   let tdPop;
   let tableData = [];
   let SVvalues;
   let maxValue;
   //filtrez datele si le iau doar pe cele care corespund anului selectat
   tableData = dataset.filter(e => e.an === anSelectat);
   //iau toate tarile intr-un vector(sunt 27 de tari in UE)
   let tari = tableData.map(elem => elem.tara).slice(0, 27);
   //pentru fiecare tara creez randul din tabel
      tari.forEach(element => {
      tr = document.createElement("tr");
      tdTara = document.createElement("td");
      tdTara.innerHTML = element;
      tdSV = document.createElement("td");
      tdPIB = document.createElement("td");
      tdPop = document.createElement("td");
      for (let index = 0; index < tableData.length; index++) {
       
         if (tableData[index].tara === element) {
            SVvalues=tableData.filter(e=>e.indicator==="SV");
            switch (tableData[index].indicator) {
               case "SV":
                  tdSV.innerHTML = (tableData[index].valoare !== null ? tableData[index].valoare : "-");
                  maxValue = Math.max(...SVvalues.map(x => x.valoare));
                  let minValue = Math.min(...SVvalues.map(x => x.valoare));
                  console.log(minValue)
                  console.log(SVvalues);
                  if(tableData[index].valoare===maxValue){
                     tdSV.style.backgroundColor="green";
                  }
                   if(tableData[index].valoare===minValue && tableData[index].valoare!==null){
                     tdSV.style.backgroundColor="red";
                  }
                  break;
               case "PIB":
                  tdPIB.innerHTML = (tableData[index].valoare!==null?tableData[index].valoare:" - ");
                  maxValue = Math.max(...tableData.filter(e=>e.indicator==="PIB").map(x => x.valoare));
                  if(tableData[index].valoare===maxValue){
                     tdPIB.style.backgroundColor="green";
                  }
                  break;
               case "POP":
                  tdPop.innerHTML = (tableData[index].valoare!==null?tableData[index].valoare:" - ");
                  maxValue = Math.max(...tableData.filter(e=>e.indicator==="POP").map(x => x.valoare));
                  if(tableData[index].valoare===maxValue){
                     tdPop.style.backgroundColor="green";
                  }

            }
           
          

         }
      }
      tr.appendChild(tdTara);
      tr.appendChild(tdSV);
      tr.appendChild(tdPIB);
      tr.appendChild(tdPop);

      tBody.appendChild(tr);
      table.appendChild(tBody);

   });

   //adaugare tabel in pagina
   document.body.appendChild(table);
}
function drawChart(dataset, taraSelectata) {
let barChart=new BarChart(document.body);

let date=dataset.filter(el=>el.tara===taraSelectata).filter(el=>el.indicator==="SV");
console.log(date);

let svg=document.getElementById("svgChart");
barChart.draw(date);


}
async function main() {
   const dataset = await getDate();
   //console.log(dataset);
   let ani = [];
   let tari = [];
   //parcurgere vector de date si extragere ani(fara duplicate)
   for (i = 0; i < dataset.length; i++) {
      if (!ani.includes(dataset[i].an)) {
         ani.push(dataset[i].an);
      }
   }
   for (i = 0; i < dataset.length; i++) {
      if (!tari.includes(dataset[i].tara)) {
         tari.push(dataset[i].tara);
      }
   }
   console.log(ani);
   let select = document.getElementById("ani");
   let selectTara = document.getElementById("selectTara");
   select.add(new Option("Selecteaza an"));
   selectTara.add(new Option("Selecteaza tara"));
   //populare cu anii selectati din array
   for (let a in ani) {
      select.add(new Option(ani[a]));
   }
   for (let t in tari) {
      selectTara.add(new Option(tari[t]));
   }

   let btnDrawTable = document.getElementById("btnDeseneazaTabel");
   let btnDrawBublechart = document.getElementById("btnBubbleChart");
   let btnBarchart=document.getElementById("btnChart");
   let anSelectat = undefined;
   let taraSelectata=undefined;
   
   select.addEventListener("change", function () {
      anSelectat = this.value;
      btnDrawTable.style.display = "inline-block";
      btnDrawBublechart.style.display = "inline-block";
   });
   selectTara.addEventListener("change", function () {
      taraSelectata = this.value;
      btnBarchart.style.display = "inline-block";
      
   })
   btnDrawTable.addEventListener('click', function () {
      console.log(anSelectat);
      if (anSelectat !== "Selecteaza an") {
         drawTable(dataset, anSelectat);
      }
      else {
         alert("Selectati un an!");
      }

   })
   //drawTable(dataset, anSelectat);
       
   btnBarchart.addEventListener("click",function(){
      drawChart(dataset,taraSelectata);
   });
 

}

class BarChart {
   constructor(domElement) {
       this.domElement = domElement;
       this.svgns = "http://www.w3.org/2000/svg" 
       this.width = domElement.clientWidth/2;
       this.height = domElement.clientHeight;
       
   }
   draw(data) {
      this.data = data;
      this.createSVG();
      this.drawBackground();
      this.drawBars(data);
   }
  createSVG() {
   this.svg = document.createElementNS(this.svgns, "svg");
   this.svg.style.borderColor = "black";
   this.svg.style.borderWidth = "1px";
   this.svg.style.borderStyle = "solid";
   this.svg.setAttribute("width", this.width);
   this.svg.setAttribute("height", this.height);
   this.svg.setAttribute("id","svgChart");
   this.domElement.appendChild(this.svg);
}
drawBackground() {
   const rect = document.createElementNS(this.svgns, "rect");
   rect.setAttribute("x", 0);
   rect.setAttribute("y", 0);
   rect.setAttribute("width", this.width);
   rect.setAttribute("height", this.height);
   rect.style.fill = "WhiteSmoke";

   this.svg.appendChild(rect);

}
drawBars() {
   const barWidth = this.width / this.data.length;
   const maxValue = Math.max(...this.data.map(x => x[3]));//maxim de pe a doua componenta din subvectori
   const f = this.height / maxValue;

   for (let i = 0; i < this.data.length; i++) {
       const label = this.data[i].an;
       const value = this.data[i].valoare;
       console.log(value)
       const barHeight = value * 0.9;
       console.log(barHeight);
       const barX = i * barWidth;
       const barY = this.height - barHeight;


       const bar = document.createElementNS(this.svgns, "rect");
       bar.setAttribute("x", barX + barWidth / 4);
       bar.setAttribute("y", barY);
       bar.setAttribute("width", barWidth / 2);
       bar.setAttribute("height", barHeight);
       bar.style.fill="#db4437"
       bar.style.stroke="black";
       let strWidth="stroke-width";
       bar.style["stroke-width"]="2px";

       this.svg.appendChild(bar);
       const text = document.createElementNS(this.svgns, "text");
       //setare continut
       text.appendChild(document.createTextNode(label));
       //setare coordonate
       text.setAttribute("x", barX);
       text.setAttribute("y", this.height-10);
       this.svg.appendChild(text);
   }
  
}
}


main();

//idee: spinner-kind-of-thing cu anii si cand alege userul se creeaza tabel -> SEEMS TO WORK

