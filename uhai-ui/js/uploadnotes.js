const url = 'http://127.0.0.1:8000/summarize/';
let similarUrl = 'http://127.0.0.1:8000/similar/';

window.onload = function () {
  // Get the submit file button
  btnUpload = document.getElementById("file-submit");

  //On click fetch summary
  btnUpload.onclick = function (e) {
    e.preventDefault();
    fetchSummary(url)
  };

  // Get the submit summary button
  btnSimilar = document.getElementById('similar-submit');

  // On click fetch similar laws
  btnSimilar.onclick = function (e) {
    e.preventDefault();
    fetchSimilar(similarUrl)

  }
}

/*
This function takes text from the similar-area text area and makes
 a post request to similar API. The API returns a list of cases 
and sections that are similar to that text.
 */
function fetchSimilar(similarUrl) {
  // Get the text from similar-area text area
  text = document.getElementById('similar-area').value;

  // Define the request to get similar cases from similar API
  let text_data = {
    source_text: text
  }
  let request = new Request(similarUrl, {
    method: 'POST',
    body: JSON.stringify(text_data),
    headers: new Headers({

      'Content-Type': 'application/json; charset=UTF-8'
    })
  });

  // Fetch data from the similar API
  fetch(request)
    .then(response => {
      //handle response            
      return response.json();
    })

    // Given the data returned from similar API
    .then(data => {

      // Get the div element that carries cases and clear what was there
      caseContainer = document.getElementById("case-container")
      caseContainer.replaceChildren();

      // Get the div that holds the title for cases and clear what was there
      similarTitle = document.getElementById("similar-title")
      similarTitle.replaceChildren();

      // Create the h2 element to hold title
      let casesTitle = document.createElement('h2');
      casesTitle.innerHTML = 'Similar Cases';
      casesTitle.classList.add('cases-h2')
      similarTitle.appendChild(casesTitle)

      // Get cases only to display
      let cases = data.cases;

      // Display each case accordingly
      cases.map(function (aCase) {

        displayCase(aCase, caseContainer)

      });

      // Display each section accordingly
      let sections = data.sections;
      sections.map(function (section) {

        displaySection(section, caseContainer)

      });
    })
    .catch(rejected => {
      console.log(rejected);
    });
}
/*
This function takes a file from the file upload input and makes
a post request to summarize API. The API returns a summary of the
text extracted.
 */
function fetchSummary(url) {

  // Get file
  let aFile = document.getElementById("file-upload").files[0]


  // // Define request to get summary
  const formData = new FormData();
  formData.append("file", aFile, aFile.name);

  let request = new Request(url, {
    method: 'POST',
    body: formData,

  });

  // Fetch data
  fetch(request)
    .then(response => {
      return response.json();
    })
    // Given the data returned
    .then(data => {

      let div = document.getElementById("message-div");
      div.replaceChildren();

      displaySummary(data, div)
    })
    .catch(rejected => {
      console.log(rejected);


    });
}
/*
This function displays the summary to a paragraph element and
prefills the similar-area text area
 */
function displaySummary(summary, container) {
  let p = document.createElement('p');
  p.innerHTML = summary;
  p.classList.add('summary-para')
  let title = document.createElement('label');
  title.innerHTML = 'Summary';
  title.classList.add("tm-color-primary")

  container.appendChild(title);
  container.appendChild(p);
  let area = document.getElementById("similar-area");
  area.classList.add('summary-area')
  area.innerHTML = summary;

}

/*
This function displays a section returned from the similar API
 */
function displaySection(section, container) {

  let article = document.createElement('article');
  article.classList.add('col-12', 'col-md-6', 'tm-post');
  container.appendChild(article);

  let hr = document.createElement('hr');
  hr.classList.add('tm-hr-primary');
  article.appendChild(hr);

  let a = document.createElement('a');
  a.classList.add('effect-lily', 'tm-post-link');
  article.appendChild(a);


  let h2 = document.createElement('h2');
  h2.innerHTML = `${section.act_no}` + ': ' + `${section.act_title}`;
  h2.classList.add('tm-pt-30', 'tm-color-primary', 'tm-post-title');
  a.appendChild(h2);

  if (`${section.part_title}` !== null) {
    let h4 = document.createElement('h4');
    h4.innerHTML = `${section.part_title}`;
    h4.classList.add('section-h4')
    article.appendChild(h4);

  }

  if (`${section.section_title}` !== null) {
    let h5 = document.createElement('h5');
    h5.innerHTML = `${section.section_title}`;
    article.appendChild(h5);

  }

  let p = document.createElement('p');
  p.innerHTML = `${section.section_content}`;
  p.classList.add('tm-pt-30', 'para');
  article.appendChild(p);

}

/*
This function displays a case returned from the similar API
 */
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

