# 📂 Task Breakdown Template

## 0️⃣ Quick Summary / Goal
Migrate| T-009 | Replace LineageGraphView | Update parent components | EP-03 | 1h | T-008 | Dev | ✅ |

### Epic: API Integration

#### 2.1 Feature List
| Feature ID | Title | Short Description | Priority (MoSCoW) | Status |
|------------|-------|-------------------|-------------------|--------|
| FE-09 | Service Layer Update | Modify API calls for new contract | Must | Draft |
| FE-10 | Data Transformation | Convert server data to React Flow format | Must | Draft |

#### 2.2 Tasks
| Task ID | Title | Description | Epic | Estimate | Dependencies | Assignee | Status |
|---------|-------|-------------|------|----------|-------------|----------|--------|
| T-010 | Update lineageService.ts | Modify API calls for new schema | EP-04 | 1h | T-005 | Dev | ✅ |
| T-011 | Create data transformers | Server data to React Flow format | EP-04 | 1.5h | T-010 | Dev | ✅ |
| T-012 | Update React Query hooks | Integrate with new service layer | EP-04 | 0.5h | T-011 | Dev | ✅ |
| T-013 | Create comprehensive demo | ReactFlowLineageDemo with full features | EP-04 | 1h | T-012 | Dev | ✅ | from custom D3/SVG to React Flow with draggable nodes and updated server contracts

---

## 1️⃣ Epic Overview

| Epic ID | Epic Name | Description | KPI / Success Metric | Owner | Status |
|---------|-----------|-------------|----------------------|-------|--------|
| EP-01 | React Flow Setup | Install and configure React Flow library | Library integrated, builds successfully | Dev Team | 🔄 Draft |
| EP-02 | Type Definitions | Update TypeScript interfaces for new contracts | Types match server schema | Dev Team | 🔄 Draft |
| EP-03 | Component Migration | Replace LineageGraphView with React Flow | Draggable nodes functional | Dev Team | 🔄 Draft |
| EP-04 | API Integration | Update service layer for new server contract | API calls work with new format | Dev Team | 🔄 Draft |

---

## 2️⃣ Detailed Epics

### Epic: React Flow Setup

#### 2.1 Feature List
| Feature ID | Title | Short Description | Priority (MoSCoW) | Status |
|------------|-------|-------------------|-------------------|--------|
| FE-01 | Install React Flow | Add @xyflow/react dependency | Must | Draft |
| FE-02 | Basic Integration | Create minimal React Flow component | Must | Draft |

#### 2.2 Tasks
| Task ID | Title | Description | Epic | Estimate | Dependencies | Assignee | Status |
|---------|-------|-------------|------|----------|-------------|----------|--------|
| T-001 | Install @xyflow/react | `npm install @xyflow/react` | EP-01 | 0.5h | None | Dev | ✅ |
| T-002 | Create ReactFlowLineage.tsx | Basic React Flow wrapper component | EP-01 | 1h | T-001 | Dev | ✅ |

### Epic: Type Definitions

#### 2.1 Feature List
| Feature ID | Title | Short Description | Priority (MoSCoW) | Status |
|------------|-------|-------------------|-------------------|--------|
| FE-03 | Node Types | Define React Flow node structure | Must | Draft |
| FE-04 | Edge Types | Define React Flow edge structure | Must | Draft |
| FE-05 | API Types | Server response interfaces | Must | Draft |

#### 2.2 Tasks
| Task ID | Title | Description | Epic | Estimate | Dependencies | Assignee | Status |
|---------|-------|-------------|------|----------|-------------|----------|--------|
| T-003 | Update LineageNode interface | Match React Flow node format | EP-02 | 0.5h | None | Dev | ✅ |
| T-004 | Update LineageEdge interface | Match React Flow edge format | EP-02 | 0.5h | None | Dev | ✅ |
| T-005 | Create server response types | LineageResponse, NodeData, EdgeData | EP-02 | 1h | T-003, T-004 | Dev | ✅ |

### Epic: Component Migration

#### 2.1 Feature List
| Feature ID | Title | Short Description | Priority (MoSCoW) | Status |
|------------|-------|-------------------|-------------------|--------|
| FE-06 | Custom Node Component | Table node with column display | Must | Draft |
| FE-07 | Draggable Functionality | Enable node dragging | Must | Draft |
| FE-08 | Controls Integration | Zoom, pan, fit view controls | Should | Draft |

#### 2.2 Tasks
| Task ID | Title | Description | Epic | Estimate | Dependencies | Assignee | Status |
|---------|-------|-------------|------|----------|-------------|----------|--------|
| T-006 | Create TableNode component | Custom node showing table details | EP-03 | 2h | T-002 | Dev | ✅ |
| T-007 | Implement drag handlers | Enable node position updates | EP-03 | 1h | T-006 | Dev | ✅ |
| T-008 | Add React Flow controls | Zoom, pan, minimap controls | EP-03 | 1h | T-007 | Dev | ✅ |
| T-009 | Replace LineageGraphView | Update parent components | EP-03 | 1h | T-008 | Dev | ✅ |

### Epic: API Integration

#### 2.1 Feature List
| Feature ID | Title | Short Description | Priority (MoSCoW) | Status |
|------------|-------|-------------------|-------------------|--------|
| FE-09 | Service Layer Update | Modify API calls for new contract | Must | Draft |
| FE-10 | Data Transformation | Convert server data to React Flow format | Must | Draft |

#### 2.2 Tasks
| Task ID | Title | Description | Epic | Estimate | Dependencies | Assignee | Status |
|---------|-------|-------------|------|----------|-------------|----------|--------|
| T-010 | Update lineageService.ts | Modify API calls for new schema | EP-04 | 1h | T-005 | Dev | ✅ |
| T-011 | Create data transformers | Server data to React Flow format | EP-04 | 1.5h | T-010 | Dev | ✅ |
| T-012 | Update React Query hooks | Integrate with new service layer | EP-04 | 0.5h | T-011 | Dev | ✅ |
| T-013 | Test integration | Verify React Flow lineage works end-to-end | EP-04 | 1h | T-012 | Dev | ⏳ |

---

## 3️⃣ Dependencies & Critical Path

### External Dependencies
- @xyflow/react library installation
- Server API updates (assumed parallel development)

### Critical Path
T-001 → T-002 → T-006 → T-007 → T-008 → T-009

### Total Estimate
- Setup: 1.5h
- Types: 2h  
- Components: 5h
- API: 3h
- **Total: 11.5h**

---

## 4️⃣ Implementation Order

1. **Phase 1**: Setup & Types (T-001 → T-005) - 2.5h
2. **Phase 2**: Core Component (T-006 → T-008) - 4h  
3. **Phase 3**: Integration (T-009 → T-012) - 3h
4. **Phase 4**: Testing & Cleanup - 2h
