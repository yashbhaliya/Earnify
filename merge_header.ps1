$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Resources\index.html'
$c = [System.IO.File]::ReadAllText($f)

$oldBlock = '    <div class="resource-box">
      <label class="resource-label">SELECT RESOURCE TYPE:</label>

      <div class="custom-select" onclick="toggleDropdown()">
        <img src="/file/all.jpg" class="select-icon" id="selectedIcon">
        <span id="selectedText">All Resources</span>
        <span class="arrow">&#9660;</span>
      </div>

      <div class="dropdown" id="dropdownMenu">
        <div onclick="selectOption(''all'',''All Resources'',''/file/pdf.jpg'')">
          <img src="/file/pdf.jpg"> All Resources
        </div>

        <div onclick="selectOption(''pdf'',''PDF Notes'',''/file/pdf.jpg'')">
          <img src="/file/pdf.jpg"> PDF Notes
        </div>

        <div onclick="selectOption(''excel'',''Excel Templates'',''/file/excel.jpg'')">
          <img src="/file/excel.jpg"> Excel Templates
        </div>

        <div onclick="selectOption(''exam'',''Exam Materials'',''/file/exam.jpg'')">
          <img src="/file/exam.jpg"> Exam Materials
        </div>

        <div onclick="selectOption(''freelance'',''Freelance Services'',''/file/service.jpg'')">
          <img src="/file/service.jpg"> Freelance Services
        </div>
      </div>
    </div>

    <div id="all" class="tab-content active">
      <div class="resource-section">
        <div class="section-header">
          <div class="section-title">
            <h2>All Resources</h2>
            <span class="resource-count" id="allCount">0 items</span>
          </div>
          <div class="add-buttons-group">
            <button class="add-btn pdf-btn" onclick="showAddModal(''pdf'')">
              <span class="btn-icon"><img src="/file/pdf.jpg" alt="PDF"
                  style="width:20px;height:20px;object-fit:contain;vertical-align:middle;"></span>
              <span class="btn-text">Add PDF</span>
            </button>
            <button class="add-btn excel-btn" onclick="showAddModal(''excel'')">
              <span class="btn-icon"><img src="/file/excel.jpg" alt="Excel"
                  style="width:20px;height:20px;object-fit:contain;vertical-align:middle;"></span>
              <span class="btn-text">Add Excel</span>
            </button>
            <button class="add-btn exam-btn" onclick="showAddModal(''exam'')">
              <span class="btn-icon"><img src="/file/exam.jpg" alt="Exam"
                  style="width:20px;height:20px;object-fit:contain;vertical-align:middle;"></span>
              <span class="btn-text">Add Exam</span>
            </button>
            <button class="add-btn freelance-btn" onclick="showAddModal(''freelance'')">
              <span class="btn-icon"><img src="/file/service.jpg" alt="Freelance"
                  style="width:20px;height:20px;object-fit:contain;vertical-align:middle;"></span>
              <span class="btn-text">Add Service</span>
            </button>
          </div>
        </div>
        <div class="resource-grid" id="allGrid">'

$newBlock = '    <div class="combined-header-card">

      <!-- TOP: Dropdown selector -->
      <div class="chc-top">
        <div class="chc-left">
          <p class="chc-label">SELECT RESOURCE TYPE</p>
          <div class="custom-select" onclick="toggleDropdown()">
            <img src="/file/all.jpg" class="select-icon" id="selectedIcon">
            <span id="selectedText">All Resources</span>
            <span class="arrow">&#9660;</span>
          </div>
          <div class="dropdown" id="dropdownMenu">
            <div onclick="selectOption(''all'',''All Resources'',''/file/pdf.jpg'')">
              <img src="/file/pdf.jpg"> All Resources
            </div>
            <div onclick="selectOption(''pdf'',''PDF Notes'',''/file/pdf.jpg'')">
              <img src="/file/pdf.jpg"> PDF Notes
            </div>
            <div onclick="selectOption(''excel'',''Excel Templates'',''/file/excel.jpg'')">
              <img src="/file/excel.jpg"> Excel Templates
            </div>
            <div onclick="selectOption(''exam'',''Exam Materials'',''/file/exam.jpg'')">
              <img src="/file/exam.jpg"> Exam Materials
            </div>
            <div onclick="selectOption(''freelance'',''Freelance Services'',''/file/service.jpg'')">
              <img src="/file/service.jpg"> Freelance Services
            </div>
          </div>
        </div>
        <div class="chc-right">
          <div class="chc-title-row">
            <h2 class="chc-title">All Resources</h2>
            <span class="resource-count" id="allCount">0 items</span>
          </div>
          <div class="add-buttons-group">
            <button class="add-btn pdf-btn" onclick="showAddModal(''pdf'')">
              <span class="btn-icon"><img src="/file/pdf.jpg" alt="PDF" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;"></span>
              <span class="btn-text">Add PDF</span>
            </button>
            <button class="add-btn excel-btn" onclick="showAddModal(''excel'')">
              <span class="btn-icon"><img src="/file/excel.jpg" alt="Excel" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;"></span>
              <span class="btn-text">Add Excel</span>
            </button>
            <button class="add-btn exam-btn" onclick="showAddModal(''exam'')">
              <span class="btn-icon"><img src="/file/exam.jpg" alt="Exam" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;"></span>
              <span class="btn-text">Add Exam</span>
            </button>
            <button class="add-btn freelance-btn" onclick="showAddModal(''freelance'')">
              <span class="btn-icon"><img src="/file/service.jpg" alt="Freelance" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;"></span>
              <span class="btn-text">Add Service</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <div id="all" class="tab-content active">
      <div class="resource-section">
        <div class="resource-grid" id="allGrid">'

if ($c.Contains($oldBlock)) {
    $c2 = $c.Replace($oldBlock, $newBlock)
    [System.IO.File]::WriteAllText($f, $c2)
    Write-Host "Done - replaced successfully"
} else {
    Write-Host "NOT FOUND - checking partial..."
    $idx = $c.IndexOf('resource-box')
    Write-Host "resource-box at index:" $idx
}
