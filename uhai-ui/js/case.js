let url = 'http://127.0.0.1:8000/cases/';
let aCase = new URLSearchParams(window.location.search).get("key");
let fullUrl = url+aCase;

get_case(fullUrl);

// function to display a specific case
function get_case(fullUrl){
      fetch(fullUrl)
      .then(response => {
        return response.json();
      })
      .then(data => {
        caseTitle = document.getElementById('case-title');
        caseTitle.innerHTML = `${data.meta_info['Citation:']}`;
        meta_info = data.meta_info;
       
            for (const [key, value] of Object.entries(meta_info)) {
    
            let tr = document.createElement('tr'); 
            let th = document.createElement('th');
            th.innerHTML = key
            let td = document.createElement('td');
            td.innerHTML = value;
    
            tr.appendChild(th)
            tr.appendChild(td)
            
            tableMeta = document.getElementById('table-meta');
            tableMeta.appendChild(tr)
               
              }
              judgementTitle = document.createElement("h2");
              judgementTitle.innerHTML = "Judgement"
              judgementTitle.classList.add('judgement-title')
              meta.appendChild(judgementTitle)
              data.judgement.map(function(judgement) {
                let p = document.createElement('p');
                p.innerHTML = judgement;
                p.classList.add('judgement-para')
                meta.appendChild(p)
            });
      
        })
      .catch(rejected => {
        console.log(rejected);
    });

    

    
}

