# 🧪 Finance Dashboard Backend - Test Scenarios

## 🚀 Quick Start Testing

### 1. Server Health Check
```powershell
# Basic health check
Invoke-RestMethod -Uri "http://localhost:5000/health"

# Expected: Success response with server status
```

### 2. Authentication Flow
```powershell
# Login with different roles
$adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@finance.com","password":"admin123"}'
$analystResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"analyst@finance.com","password":"analyst123"}'
$viewerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"viewer@finance.com","password":"viewer123"}'

# Extract tokens
$adminToken = $adminResponse.data.token
$analystToken = $analystResponse.data.token
$viewerToken = $viewerResponse.data.token
```

## 🔐 Role-Based Access Control Testing

### 3. Admin User Testing
```powershell
# Full CRUD operations
Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $adminToken"} -Method POST -ContentType "application/json" -Body '{"amount":1000,"type":"income","category":"Test","date":"2026-04-01"}'
Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $adminToken"}
Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Headers @{"Authorization"="Bearer $adminToken"}
```

### 4. Analyst User Testing
```powershell
# Read operations should work
Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $analystToken"}
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/monthly" -Headers @{"Authorization"="Bearer $analystToken"}

# Write operations should fail
try { Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $analystToken"} -Method POST -ContentType "application/json" -Body '{"amount":1000,"type":"income","category":"Test"}' } catch { "Expected 403 error" }
```

### 5. Viewer User Testing
```powershell
# Basic read operations should work
Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $viewerToken"}
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/summary" -Headers @{"Authorization"="Bearer $viewerToken"}

# Advanced analytics should fail
try { Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/monthly" -Headers @{"Authorization"="Bearer $viewerToken"} } catch { "Expected 403 error" }
```

## 📊 Data Management Testing

### 6. Financial Records CRUD
```powershell
# Create record
$newRecord = Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $adminToken"} -Method POST -ContentType "application/json" -Body '{"amount":2500,"type":"income","category":"Bonus","date":"2026-04-01","note":"Performance bonus"}'
$recordId = $newRecord.data.record.id

# Read record
Invoke-RestMethod -Uri "http://localhost:5000/api/records/$recordId" -Headers @{"Authorization"="Bearer $adminToken"}

# Update record
Invoke-RestMethod -Uri "http://localhost:5000/api/records/$recordId" -Headers @{"Authorization"="Bearer $adminToken"} -Method PUT -ContentType "application/json" -Body '{"amount":3000,"note":"Updated bonus"}'

# Soft delete record
Invoke-RestMethod -Uri "http://localhost:5000/api/records/$recordId" -Headers @{"Authorization"="Bearer $adminToken"} -Method DELETE

# Verify soft delete (record should still exist but marked as deleted)
Invoke-RestMethod -Uri "http://localhost:5000/api/records/$recordId" -Headers @{"Authorization"="Bearer $adminToken"}
```

### 7. Search and Filtering
```powershell
# Search by keyword
Invoke-RestMethod -Uri "http://localhost:5000/api/records?search=investment" -Headers @{"Authorization"="Bearer $adminToken"}

# Filter by type
Invoke-RestMethod -Uri "http://localhost:5000/api/records?type=income" -Headers @{"Authorization"="Bearer $adminToken"}

# Filter by category
Invoke-RestMethod -Uri "http://localhost:5000/api/records?category=Salary" -Headers @{"Authorization"="Bearer $adminToken"}

# Date range filter
Invoke-RestMethod -Uri "http://localhost:5000/api/records?startDate=2024-01-01&endDate=2024-12-31" -Headers @{"Authorization"="Bearer $adminToken"}

# Pagination
Invoke-RestMethod -Uri "http://localhost:5000/api/records?page=2&limit=5" -Headers @{"Authorization"="Bearer $adminToken"}
```

## 🔍 Analytics Testing

### 8. Dashboard Endpoints
```powershell
# Financial summary
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/summary" -Headers @{"Authorization"="Bearer $adminToken"}

# Monthly trends
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/monthly" -Headers @{"Authorization"="Bearer $adminToken"}

# Category analysis
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/category" -Headers @{"Authorization"="Bearer $adminToken"}

# Recent transactions
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/recent" -Headers @{"Authorization"="Bearer $adminToken"}

# Yearly comparison
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/yearly-comparison" -Headers @{"Authorization"="Bearer $adminToken"}
```

## 📤 Export Testing

### 9. Data Export Feature
```powershell
# JSON export
Invoke-RestMethod -Uri "http://localhost:5000/api/export/records?format=json" -Headers @{"Authorization"="Bearer $adminToken"} -OutFile "financial-records.json"

# CSV export
Invoke-RestMethod -Uri "http://localhost:5000/api/export/records?format=csv" -Headers @{"Authorization"="Bearer $adminToken"} -OutFile "financial-records.csv"

# Export with filters
Invoke-RestMethod -Uri "http://localhost:5000/api/export/records?format=csv&type=income&startDate=2024-01-01&endDate=2024-12-31" -Headers @{"Authorization"="Bearer $adminToken"} -OutFile "income-2024.csv"
```

## 🚨 Error Handling Testing

### 10. Validation Errors
```powershell
# Invalid email format
try { Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"invalid","password":"123456"}' } catch { "Expected 400 validation error" }

# Missing required fields
try { Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $adminToken"} -Method POST -ContentType "application/json" -Body '{"type":"income"}' } catch { "Expected 400 validation error" }

# Invalid enum values
try { Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $adminToken"} -Method POST -ContentType "application/json" -Body '{"amount":1000,"type":"invalid","category":"Test"}' } catch { "Expected 400 validation error" }
```

### 11. Authentication Errors
```powershell
# Invalid credentials
try { Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@finance.com","password":"wrong"}' } catch { "Expected 401 error" }

# No token provided
try { Invoke-RestMethod -Uri "http://localhost:5000/api/records" } catch { "Expected 401 error" }

# Invalid token
try { Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer invalid-token"} } catch { "Expected 401 error" }

# Expired token (simulate by waiting 7 days)
# Test with old token after expiration
```

### 12. Authorization Errors
```powershell
# Viewer trying to access admin endpoint
try { Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Headers @{"Authorization"="Bearer $viewerToken"} } catch { "Expected 403 error" }

# Analyst trying to create record
try { Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $analystToken"} -Method POST -ContentType "application/json" -Body '{"amount":1000,"type":"income","category":"Test"}' } catch { "Expected 403 error" }
```

## 🔧 Performance Testing

### 13. Load Testing
```powershell
# Multiple concurrent requests
for ($i=1; $i -le 10; $i++) {
    Start-Job -ScriptBlock { Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $adminToken"} }
}

# Large dataset queries
Invoke-RestMethod -Uri "http://localhost:5000/api/records?limit=100" -Headers @{"Authorization"="Bearer $adminToken"}

# Complex aggregation queries
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/monthly" -Headers @{"Authorization"="Bearer $adminToken"}
```

## 📝 Expected Results

### ✅ Success Indicators
- **200 OK**: Successful operations
- **201 Created**: Resource created successfully
- **Proper JSON**: Structured response format
- **Performance**: Response times under 200ms
- **Pagination**: Correct metadata returned

### ❌ Error Indicators
- **400 Bad Request**: Validation errors with details
- **401 Unauthorized**: Authentication failures
- **403 Forbidden**: Authorization failures
- **404 Not Found**: Resource not found
- **500 Internal Server**: Unexpected server errors

## 🎯 Test Completion Checklist

- [ ] All authentication flows tested
- [ ] Role-based access control verified
- [ ] CRUD operations working
- [ ] Search and filtering functional
- [ ] Analytics endpoints responding
- [ ] Export feature working
- [ ] Error handling proper
- [ ] Performance acceptable
- [ ] Documentation accessible

## 🚀 Automation Script

```powershell
# Automated test runner
function Run-AllTests {
    param($Token)
    
    Write-Host "🧪 Starting Finance Dashboard Backend Tests..."
    
    # Test health
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health"
    Write-Host "✅ Health Check: $($health.success)"
    
    # Test records
    $records = Invoke-RestMethod -Uri "http://localhost:5000/api/records" -Headers @{"Authorization"="Bearer $Token"}
    Write-Host "✅ Records API: $($records.success) - $($records.data.records.Count) records"
    
    # Test analytics
    $summary = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/summary" -Headers @{"Authorization"="Bearer $Token"}
    Write-Host "✅ Summary API: $($summary.success)"
    
    Write-Host "🎯 All tests completed!"
}

# Usage
$adminToken = (Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@finance.com","password":"admin123"}').data.token
Run-AllTests -Token $adminToken
```

This comprehensive test suite covers all aspects of the Finance Dashboard Backend! 🚀
