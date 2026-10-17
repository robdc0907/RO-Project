function historicalRecords(){
  const source=data.filter(r=>r.year===$('period').value&&($('month').value==='all'||r.month===$('month').value)&&($('division').value==='all'||r.division===$('division').value)&&($('me').value==='all'||r.name===$('me').value));
  const groups=new Map();
  for(const r of source){
    const key=[r.year,r.month,r.division,r.name].join('|');
    const row=groups.get(key)||{year:r.year,month:r.month,division:r.division,name:r.name,customers:0,b2b:0,b2c:0,institutions:0,articles:0,revenue:0};
    row.customers++;row[r.type==='B2B'?'b2b':'b2c']++;row.institutions+=r.institution;row.articles+=r.articleCount;row.revenue+=r.revenue;groups.set(key,row);
  }
  const query=$('historySearch').value.trim().toLowerCase();
  return [...groups.values()].filter(r=>!query||r.name.toLowerCase().includes(query)||r.division.toLowerCase().includes(query)).sort((a,b)=>b.year.localeCompare(a.year)||months.indexOf(b.month)-months.indexOf(a.month)||a.division.localeCompare(b.division)||a.name.localeCompare(b.name));
}

function renderHistoricalSheet(){
  if(!$('historyRows'))return;
  const rows=historicalRecords();
  $('historyRows').innerHTML=rows.map(r=>`<tr><td>${r.year}</td><td>${r.month}</td><td class="division-cell">${r.division}</td><td class="division-cell">${r.name}</td><td class="count">${r.customers}</td><td>${r.b2b}</td><td>${r.b2c}</td><td>${r.institutions}</td><td>${r.articles}</td><td class="count">${money(r.revenue)}</td><td><button class="btn history-open" data-year="${r.year}" data-month="${r.month}" data-division="${r.division}" data-me="${r.name}" style="padding:5px 7px">Open dashboard ↗</button></td></tr>`).join('')||'<tr><td colspan="11" style="padding:20px;color:#999">No history matches the selected filters.</td></tr>';
  $('historyCount').textContent=`${rows.length} monthly ME records · ${new Set(rows.map(r=>r.name)).size} MEs`;
}

function showDashboardView(view){
  const history=view==='history';
  $('dashboardPanels').style.display=history?'none':'';
  $('historySheet').style.display=history?'':'none';
  $('mainTitle').textContent=history?'Historical ME sheet':'Customer conversion dashboard';
  $('mainSubtitle').textContent=history?'Review monthly ME customer, parcel, institution, and revenue history.':'ME activity, customer types, payment plans, and institutions converted.';
  $('crumbTitle').textContent=history?'Historical ME sheet':'Division overview';
  document.querySelectorAll('.nav-item').forEach((b,i)=>b.classList.toggle('active',history?i===1:i===0));
  if(history)renderHistoricalSheet();
}

document.querySelectorAll('.nav-item').forEach((button,index)=>button.addEventListener('click',()=>{
  if(index===0)showDashboardView('dashboard');
  if(index===1)showDashboardView('history');
}));
['period','month','division','me'].forEach(id=>$(id).addEventListener('change',renderHistoricalSheet));
$('historySearch').addEventListener('input',renderHistoricalSheet);
$('save').addEventListener('click',renderHistoricalSheet);
$('monthlyRows').addEventListener('click',event=>{
  const cell=event.target.closest('[data-month-view]');
  if(!cell)return;
  $('month').value=cell.dataset.monthView;
  $('division').value=cell.dataset.divisionView;
  fillME();
  render();
  showDashboardView('history');
});
$('monthlyRows').addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' '){
    const cell=event.target.closest('[data-month-view]');
    if(cell){event.preventDefault();cell.click();}
  }
});
$('historyRows').addEventListener('click',event=>{
  const button=event.target.closest('.history-open');
  if(!button)return;
  $('period').value=button.dataset.year;
  $('month').value=button.dataset.month;
  $('division').value=button.dataset.division;
  fillME();
  $('me').value=button.dataset.me;
  render();
  showDashboardView('dashboard');
});
$('exportHistory').addEventListener('click',()=>{
  const rows=historicalRecords();
  const csv='Year,Month,Division,Marketing Executive,Customers made,B2B,B2C,Institutions,Articles or parcels,Revenue INR\n'+rows.map(r=>[r.year,r.month,r.division,r.name,r.customers,r.b2b,r.b2c,r.institutions,r.articles,r.revenue].map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
  const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));link.download='historical-me-sheet.csv';link.click();URL.revokeObjectURL(link.href);
});
