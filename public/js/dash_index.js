let attemptpage = 1;
let attempttotal = 0;
let startnav = true;

function fetchAttempts(page){
    fetch(`/dashbrd/attempts/${page}`)
    .then(function(response){
        return response.json();
    })
    .then(function(result){
        if(!result.okay){
            console.log("Erro ao receber os logs de segurança.");
        }
        else{
            attemptpage = page;
            attempttotal = result.pages;
            attemptNav(page, result.pages);
            attemptRows(result.rows);            
        }
    })
}

function fetchStats(){
    fetch(`/dashbrd/stats`)
    .then(function(response){
        return response.json();
    })
    .then(function(result){
        if(!result.okay){
            console.log("Erro ao receber as estatísticas do site");
        }
        else{
            console.log(result);
            let scale = "MB";
            let size = result.upload / 1048576;
            //1024^2 -- converting from bytes to mb
            if(size > 1024){
                //is it over a gigabyte? then convert
                size = size / 1024;
                scale = "GB";
            }
            size = size.toFixed(2);  

            document.querySelector("#total-posts").innerHTML = result.posts;
            document.querySelector("#total-bcategories").innerHTML = result.blogcategories;

            document.querySelector("#total-projects").innerHTML = result.projects;
            document.querySelector("#total-dcategories").innerHTML = result.devcategories;

            let totaldesign = result.logo + result.print + result.art + result.vid;
            document.querySelector("#total-design").innerHTML = totaldesign;
            
            document.querySelector("#upload-size").innerHTML = `${size} ${scale}`;
            
            drawChart([result.logo, result.print, result.art, result.vid], [result.posts, result.projects, totaldesign]);
        }
    });
}

function attemptRows(rows){
    //Inside rows we got: _id, success, email, time, type (login, passchange, emailchange)
    let tbody = document.querySelector("#security-table tbody");
    tbody.innerHTML = "";

    rows.forEach(row =>{
        let tr = document.createElement('tr');
        let type = 'Login';
        switch(row.type){
            case 'passchange':
                type = 'Mudança de senha';
                break;
            case 'emailchange':
                type = 'Mudança de e-mail';
                break;
        }
        let time = new Date(row.time);
        let success = `<td class="sec-success"><i class="material-icons">check</i> Sucesso</td>`;
        if(!row.success){
            success = `<td class="sec-fail"><i class="material-icons">clear</i> Falha</td>`;
        }
        tr.innerHTML = `
            <td>${PrettyDate.fullDate(time)}</td>
            <td>${type}</td>
            <td>${row.email}</td>
            ${success}
        `;

        tbody.appendChild(tr);
    });
}

function attemptNav(page, pagestotal){
    let firstBtn = document.querySelector("#sec-page-first");
    let prevBtn = document.querySelector("#sec-page-prev");
    let noForm = document.querySelector("#sec-page-form");
    let noInput = document.querySelector("#sec-page-no");
    let totalEl = document.querySelector("#sec-page-total");
    let nextBtn = document.querySelector("#sec-page-next");
    let lastBtn = document.querySelector("#sec-page-last");

    noInput.value = page;
    noInput.max = pagestotal;

    totalEl.innerHTML = pagestotal;

    if(page < 2){
        firstBtn.disabled = true;
        prevBtn.disabled = true;
    }
    else{
        firstBtn.disabled = false;
        prevBtn.disabled = false;
    }

    if(page === pagestotal || pagestotal === 0){
        nextBtn.disabled = true;
        lastBtn.disabled = true;
    }
    else{
        nextBtn.disabled = false;
        lastBtn.disabled = false;
    }

    if(pagestotal < 2){
        noInput.disabled = true;
    }
    else{
        noInput.disabled = false;
    }

    if(startnav){
        startnav = false;

        firstBtn.addEventListener('click', e=>{
            fetchAttempts(1);
        });

        prevBtn.addEventListener('click', e=>{
            fetchAttempts(attemptpage-1);
        });

        nextBtn.addEventListener('click', e=>{
            fetchAttempts(attemptpage+1);
        });

        lastBtn.addEventListener('click', e=>{
            fetchAttempts(attempttotal);
        });

        noForm.addEventListener('submit', e=>{
            e.preventDefault();
            let no = parseInt(noInput.value, 10);            
            if(no !== attemptpage){                      
                fetchAttempts(no);
            }
        });
    }
}

function drawChart(values = [0, 0, 0, 0], total = [0, 0, 0]){
    //CHART DATA
    let labels1 = ['Posts', 'Projetos', 'Designs'];
    let labels2 = ['Logos','Gráfica','Artes','Vídeos'];

    let data1 = {
        datasets: [
            {
                barPercentage: 0.9,
                data: [{x: total[0], y: labels1[0]}],
                label: labels1[0],
                backgroundColor: ["#941b10"]
            },
            {
                barPercentage: 0.9,
                data: [{x: total[1], y: labels1[1]}],
                label: labels1[1],
                backgroundColor: ["#006064"]
            },
            {
                barPercentage: 0.9,
                data: [{x: total[2], y: labels1[2]}],
                label: labels1[2],
                backgroundColor: ["#f2b442"]
            }
        ]
    };

    let data2 = {
        labels: labels2,
        datasets: [
            {
                label: 'Itens de design',
                data: values,
                backgroundColor: ["#941b10","#f2b442","#006064","#4a148c"]
            }
        ]
    };

    let config1 = {
        type: 'bar',
        data: data1,
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,                    
                },
                y: {
                    stacked: true
                }
            },
            responsive: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14
                        },
                        boxHeight: 18
                    }
                },
                title: {
                    display: true,
                    text: 'Conteúdo total',
                    font: {
                        size: 18
                    },
                    color: "#111111"
                },
                tooltip: {
                    bodyFont: {
                        size: 12
                    },
                    boxPadding: 4
                }
            }
        }

    }

    let config2 = {
        type: 'doughnut',
        data: data2,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14
                        },
                        boxHeight: 18
                    }                    
                },
                title: {
                    display: true,
                    text: 'Distribuição dos itens de design',
                    font: {
                        size: 18
                    },
                    color: "#111111"
                },
                tooltip: {
                    bodyFont: {
                        size: 12
                    },
                    boxPadding: 4
                }
            }
        }
    };

    new Chart(
        document.querySelector("#dash-barchart"),
        config1
    );

    new Chart(
        document.querySelector("#dash-piechart"),
        config2
    );
}

//FUNCTION EXECUTION
fetchAttempts(attemptpage);
fetchStats();