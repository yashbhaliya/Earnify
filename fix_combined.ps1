$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Resources\index.html'
$c = [System.IO.File]::ReadAllText($f)

$oldCard = $c.Substring($c.IndexOf('<div class="combined-card">'), $c.IndexOf('<div class="resource-grid" id="allGrid">') - $c.IndexOf('<div class="combined-card">'))

$newCard = '<div class="combined-card">

      <!-- LEFT: Dropdown -->
      <div class="cc-left">
        <p class="cc-label">Select Resource Type</p>
        <div class="custom-select" onclick="toggleDropdown()">
          <img src="/file/all.jpg" class="select-icon" id="selectedIcon">
          <span id="selectedText">All Resources</span>
          <span class="arrow">&#9660;</span>
        </div>
        <div class="dropdown" id="dropdownMenu">
          <div onclick="selectOption(''all'',''All Resources'',''/file/all.jpg'')"><img src="/file/pdf.jpg"> All Resources</div>
          <div onclick="selectOption(''pdf'',''PDF Notes'',''/file/pdf.jpg'')"><img src="/file/pdf.jpg"> PDF Notes</div>
          <div onclick="selectOption(''excel'',''Excel Templates'',''/file/excel.jpg'')"><img src="/file/excel.jpg"> Excel Templates</div>
          <div onclick="selectOption(''exam'',''Exam Materials'',''/file/exam.jpg'')"><img src="/file/exam.jpg"> Exam Materials</div>
          <div onclick="selectOption(''freelance'',''Freelance Services'',''/file/service.jpg'')"><img src="/file/service.jpg"> Freelance Services</div>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="cc-divider"></div>

      <!-- RIGHT: Title + Buttons -->
      <div class="cc-right">
        <div class="cc-title-row">
          <h2 class="cc-title">All Resources</h2>
          <span class="resource-count" id="allCount">0 items</span>
        </div>
        <div class="add-buttons-group">
          <button class="add-btn pdf-btn" onclick="showAddModal(''pdf'')">
            <span class="btn-icon"><img src="/file/pdf.jpg" alt="PDF" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;"></span>
            <span class="btn-text">Add PDF</span>
          </button>
          <button class="add-btn excel-btn" onclick="showAddModal(''excel'')">
            <span class="btn-icon"><img src="/file/excel.jpg" alt="Excel" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;"></span>
            <span class="btn-text">Add Excel</span>
          </button>
          <button class="add-btn exam-btn" onclick="showAddModal(''exam'')">
            <span class="btn-icon"><img src="/file/exam.jpg" alt="Exam" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;"></span>
            <span class="btn-text">Add Exam</span>
          </button>
          <button class="add-btn freelance-btn" onclick="showAddModal(''freelance'')">
            <span class="btn-icon"><img src="/file/service.jpg" alt="Freelance" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;"></span>
            <span class="btn-text">Add Service</span>
          </button>
        </div>
      </div>

    </div>

    '

$c2 = $c.Replace($oldCard, $newCard)
[System.IO.File]::WriteAllText($f, $c2)
Write-Host "Done. Length:" $c2.Length
