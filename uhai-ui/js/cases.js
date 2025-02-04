const url = 'http://127.0.0.1:8000/cases/';
const fullSearchUrl = 'http://127.0.0.1:8000/fulltext/cases/'

// Return all cases
caseContainer = document.getElementById('case-container')
getCases(url, caseContainer)

// Return all cases that match full text search
window.onload = function(){

    // Get full search button
    btn = document.getElementById("search-btn");

    // On click retrieve cases that match full text search on retrieve API
    btn.onclick = function(e){
        e.preventDefault();

        // Get the text in the search text field
        search = document.getElementById("search-field").value;

        // Define request to retrieve API
        fullSearchRequest = fullSearchUrl+search;

        // Get the cases          
        getCases(fullSearchRequest, caseContainer);

    };

}
/*
  This function gets cases based on the request
*/
function getCases(fullSearchRequest, caseContainer){
  fetch(fullSearchRequest)
  .then(response => {
    //handle response            
    return response.json();
  })
  .then(data => {

    let cases = data;

    // remove all the elements already in the parent
    caseContainer.replaceChildren();

    // Display each case
    cases.map(function(a_case){

        displayCase(a_case, caseContainer)
              
      });
    })
  .catch(rejected => {
    console.log(rejected);
});


}

function displayCase(aCase, caseContainer) {

  // Create article element to hold a case
  let article = document.createElement('article');
  article.classList.add('col-12', 'col-md-6', 'tm-post');
  caseContainer.appendChild(article);

  // Create hr element to separate title and case content
  let hr = document.createElement('hr');
  hr.classList.add('tm-hr-primary');
  article.appendChild(hr);

  // Create link element attach link to title
  let a = document.createElement('a');
  a.classList.add('effect-lily', 'tm-post-link');
  article.appendChild(a);

  a.href = "case.html?key=" + aCase._id

  // Create h2 element to hold title
  let h2 = document.createElement('h2');
  h2.innerHTML = `${aCase.meta_info['Citation:']}`;
  h2.classList.add('tm-pt-30', 'tm-color-primary', 'tm-post-title');
  a.appendChild(h2);

  // Create paragragh element to hold content
  let p = document.createElement('p');
  p.innerHTML = `${aCase.judgement[0]}` + `${aCase.judgement[1]}`;
  p.classList.add('tm-pt-30', 'para');
  article.appendChild(p);

  // Create date div to hold date delivered content
  let dateDiv = document.createElement('div');
  article.appendChild(dateDiv);
  let dateHeaderSpan = document.createElement('span');
  dateHeaderSpan.innerHTML = "Date Delivered";
  dateHeaderSpan.classList.add('tm-color-primary');
  dateDiv.appendChild(dateHeaderSpan);
  let dateSpan = document.createElement('span');
  dateSpan.innerHTML = `${aCase.meta_info['Date Delivered: ']}`;
  dateSpan.classList.add('tm-color-primary');
  dateDiv.classList.add('d-flex', 'justify-content-between', 'tm-pt-45');
  dateDiv.appendChild(dateSpan);

  // Create judge div to hold judge details
  let judgeDiv = document.createElement('div');
  article.appendChild(judgeDiv);
  let judgeHeaderSpan = document.createElement('span');
  judgeHeaderSpan.innerHTML = "Judge";
  judgeDiv.appendChild(judgeHeaderSpan);
  let judgeSpan = document.createElement('span');
  judgeSpan.innerHTML = `${aCase.meta_info['Judge(s): ']}`;
  judgeDiv.classList.add('d-flex', 'justify-content-between');
  judgeDiv.appendChild(judgeSpan);
}



