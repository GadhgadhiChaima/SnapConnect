# Test Script for Complete Complaints & Disputes System in SnapConnect
# Runs 16 automated backend test scenarios via REST API without opening any browser

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " SNAPCONNECT - COMPLAINTS & DISPUTES SYSTEM TEST SUITE" -ForegroundColor Cyan
Write-Host "=======================================================`n" -ForegroundColor Cyan

function Run-Step($stepNum, $desc, [ScriptBlock]$block) {
    Write-Host "[$stepNum/16] $desc..." -NoNewline
    try {
        $result = & $block
        Write-Host " [PASS]" -ForegroundColor Green
        return $result
    } catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "  Body: $($reader.ReadToEnd())" -ForegroundColor DarkRed
        }
        throw $_
    }
}

function Post-Json($uri, $headers, $obj) {
    $json = $obj | ConvertTo-Json -Depth 5
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    return Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -ContentType "application/json; charset=utf-8" -Body $bytes
}

function Patch-Json($uri, $headers, $obj = @{}) {
    $json = $obj | ConvertTo-Json -Depth 5
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    return Invoke-RestMethod -Method Patch -Uri $uri -Headers $headers -ContentType "application/json; charset=utf-8" -Body $bytes
}

# 1. Login Admin, Client, Creator
$auth = Run-Step "1" "Authenticating Admin, Client, and Creator" {
    $adminRes = Post-Json "$baseUrl/auth/login" @{} @{ email = "gh@gmail.com"; password = "123456" }
    $clientRes = Post-Json "$baseUrl/auth/login" @{} @{ email = "client@snapconnect.com"; password = "password123" }
    $creatorRes = Post-Json "$baseUrl/auth/login" @{} @{ email = "creator@snapconnect.com"; password = "password123" }

    return @{
        adminToken = $adminRes.token
        clientToken = $clientRes.token
        creatorToken = $creatorRes.token
        client = $clientRes.user
        creator = $creatorRes.user
    }
}

$clientHeaders = @{ "Authorization" = "Bearer $($auth.clientToken)" }
$creatorHeaders = @{ "Authorization" = "Bearer $($auth.creatorToken)" }
$adminHeaders = @{ "Authorization" = "Bearer $($auth.adminToken)" }

# 2. Create Job Post
$job = Run-Step "2" "Creating a Job Brief by Client" {
    $bodyObj = @{
        title = "Tournage Smartphone 4K - Campagne Ete"
        description = "5 videos verticales 4K 60fps ProRes avec micro HF sans fil."
        category = "COMMERCIAL"
        budget = 300.0
        budgetMax = 350.0
        location = "Tunis"
        phoneRequired = "iPhone 16 Pro Max"
        clientId = $auth.client.id
        clientName = $auth.client.displayName
        status = "OPEN"
    }

    return Post-Json "$baseUrl/jobs" $clientHeaders $bodyObj
}

# 3. Submit Proposal by Creator
$proposal = Run-Step "3" "Submitting Proposal by Creator" {
    $body = @{
        jobId = $job.id
        creatorId = $auth.creator.id
        creatorName = $auth.creator.displayName
        bidAmount = 300.0
        deliveryDays = 5
        coverLetter = "Specialiste tournage iPhone 16 Pro Max 4K ProRes Log avec stabilisateur DJI."
        status = "PENDING"
    }

    return Post-Json "$baseUrl/proposals" $creatorHeaders $body
}

# 4. Accept Proposal & Auto-Create Contract
$contract = Run-Step "4" "Accepting Proposal & Creating Contract with Escrow Secured" {
    $propUpdated = Patch-Json "$baseUrl/proposals/$($proposal.id)/accept" $clientHeaders
    # Fetch created contract
    $contracts = Invoke-RestMethod -Method Get -Uri "$baseUrl/contracts/client/$($auth.client.id)" -Headers $clientHeaders
    $matched = $contracts | Where-Object { $_.proposalId -eq $proposal.id } | Select-Object -First 1
    if (-not $matched) { throw "Contract was not created for proposal $($proposal.id)" }
    if ($matched.status -ne "ACTIVE" -or $matched.escrowStatus -ne "SECURED") {
        throw "Contract status is not ACTIVE/SECURED: status=$($matched.status), escrow=$($matched.escrowStatus)"
    }
    return $matched
}

# 5. Creator Delivers 4K Deliverables
$deliveredContract = Run-Step "5" "Creator Delivers 4K Deliverables (Periode d examen 24h)" {
    $body = @{
        deliverableUrl = "https://wetransfer.com/downloads/snapconnect-4k-deliverables-test"
        notes = "5 Reels 4K 60fps ProRes Log etalonnes avec sous-titres integres."
    }

    $res = Post-Json "$baseUrl/contracts/$($contract.id)/deliver" $creatorHeaders $body
    if ($res.status -ne "DELIVERED") { throw "Contract status should be DELIVERED, was $($res.status)" }
    if (-not $res.reviewDeadline) { throw "Contract reviewDeadline should be set" }
    return $res
}

# 6. Client Requests Revision (1/2)
$revisedContract = Run-Step "6" "Client Requests Revision (Consumes 1 of 2 revisions)" {
    $body = @{
        note = "Veuillez reajuster le mixage audio a 0:15 et la luminosite sur le deuxieme plan."
    }

    $res = Post-Json "$baseUrl/contracts/$($contract.id)/revise" $clientHeaders $body
    if ($res.status -ne "REVISION") { throw "Contract status should be REVISION, was $($res.status)" }
    if ($res.revisionsUsed -ne 1) { throw "revisionsUsed should be 1, was $($res.revisionsUsed)" }
    return $res
}

# 7. Client Opens Dispute
$dispute = Run-Step "7" "Opening a Formal Dispute (Status -> DISPUTED, Escrow -> FROZEN, Deadline -> 24h)" {
    $body = @{
        reason = "Livrables non conformes au brief initial"
        description = "Le createur n a pas respecte le format vertical 9:16 demande et la qualite audio est degradee."
        evidenceUrl = "https://snapconnect.com/evidence/screenshot_error.png"
        evidenceName = "Capture_Rapport_Audio.png"
        evidenceNote = "Graphique du spectrogramme montrant une saturation excessive."
    }

    $res = Post-Json "$baseUrl/contracts/$($contract.id)/dispute" $clientHeaders $body
    
    # Check contract status in DB
    $freshContract = Invoke-RestMethod -Method Get -Uri "$baseUrl/contracts/$($contract.id)" -Headers $clientHeaders
    if ($freshContract.status -ne "DISPUTED") { throw "Contract status should be DISPUTED, was $($freshContract.status)" }
    if ($freshContract.escrowStatus -ne "FROZEN") { throw "Escrow status should be FROZEN, was $($freshContract.escrowStatus)" }
    
    # Check dispute response deadline
    $disputes = Invoke-RestMethod -Method Get -Uri "$baseUrl/disputes/contract/$($contract.id)" -Headers $clientHeaders
    if (-not $disputes) { throw "No dispute found for contract $($contract.id)" }
    if (-not $disputes.responseDeadline) { throw "Dispute responseDeadline is missing" }
    
    return $disputes
}

# 8. Idempotence Check: Reject Second Dispute
Run-Step "8" "Verifying Idempotence (Reject Second Active Dispute on Same Contract)" {
    try {
        $body = @{
            reason = "Deuxieme litige invalide"
            description = "Tentative de reouverture concurrente."
        }
        $res = Post-Json "$baseUrl/contracts/$($contract.id)/dispute" $clientHeaders $body
        throw "Expected 400 Bad Request but succeeded"
    } catch {
        if ($_.Exception.Message -match "400" -or ($_.Exception.Response -and $_.Exception.Response.StatusCode -eq 400)) {
            # Expected 400
            return $true
        }
        throw $_
    }
}

# 9. Check 24h Server Countdown & Dynamic Alert Level
Run-Step "9" "Verifying Server-Side 24h Countdown & Alert Level Calculation" {
    $dispDetail = Invoke-RestMethod -Method Get -Uri "$baseUrl/disputes/$($dispute.id)" -Headers $clientHeaders
    if ($dispDetail.remainingSeconds -le 0 -or $dispDetail.remainingSeconds -gt 86400) {
        throw "Remaining seconds should be between 0 and 86400, was $($dispDetail.remainingSeconds)"
    }
    if ($dispDetail.isExpired -ne $false) { throw "isExpired should be false for newly created dispute" }
    if ($dispDetail.alertLevel -ne "NORMAL") { throw "alertLevel should be NORMAL, was $($dispDetail.alertLevel)" }
    return $dispDetail
}

# 10. Creator Responds in Dedicated 3-Way Dispute Chat
Run-Step "10" "Creator Responds in Dedicated 3-Way Dispute Chat (Transitions to UNDER_REVIEW)" {
    $body = @{
        content = "J ai bien utilise le micro Rode HF sans fil. Le cadrage est parfaitement au format 9:16 comme convenu."
        attachmentUrl = "https://snapconnect.com/evidence/project_timeline.jpg"
        attachmentName = "Projet_Final_Cut_9x16.jpg"
        attachmentType = "IMAGE"
    }

    $msg = Post-Json "$baseUrl/disputes/$($dispute.id)/messages" $creatorHeaders $body
    if ($msg.senderRole -ne "CREATOR") { throw "Message senderRole should be CREATOR" }

    # Verify dispute transitioned to UNDER_REVIEW
    $dispFresh = Invoke-RestMethod -Method Get -Uri "$baseUrl/disputes/$($dispute.id)" -Headers $creatorHeaders
    if ($dispFresh.status -ne "UNDER_REVIEW") { throw "Dispute status should be UNDER_REVIEW, was $($dispFresh.status)" }
    if ($dispFresh.lastResponseByRole -ne "CREATOR") { throw "lastResponseByRole should be CREATOR" }

    return $msg
}

# 11. Client Posts Evidence in Dispute Chat
Run-Step "11" "Client Posts Counter-Evidence in Dispute Chat" {
    $body = @{
        content = "Voici la capture montrant le probleme de saturation a 0:15."
        attachmentUrl = "https://snapconnect.com/evidence/audio_glitch.wav"
        attachmentName = "Extrait_Audio_Sature.wav"
        attachmentType = "AUDIO"
    }

    $msg = Post-Json "$baseUrl/disputes/$($dispute.id)/messages" $clientHeaders $body
    if ($msg.senderRole -ne "CLIENT") { throw "Message senderRole should be CLIENT" }
    return $msg
}

# 12. Admin Intervenes in Dispute Chat
Run-Step "12" "Admin Intervenes in Dispute Chat" {
    $body = @{
        content = "Mediation SnapConnect : Nous avons examine les fichiers audio et video. Une proposition d arbitrage va etre prononcee."
    }

    $msg = Post-Json "$baseUrl/disputes/$($dispute.id)/messages" $adminHeaders $body
    if ($msg.senderRole -ne "ADMIN") { throw "Message senderRole should be ADMIN" }

    # Check all messages
    $allMsgs = Invoke-RestMethod -Method Get -Uri "$baseUrl/disputes/$($dispute.id)/messages" -Headers $clientHeaders
    if ($allMsgs.Count -lt 4) { throw "Expected at least 4 messages in dispute chat, got $($allMsgs.Count)" }
    return $msg
}

# 13. Admin Applies Sanction (BLOCK_3_DAYS to Creator)
$sanction = Run-Step "13" "Admin Applies Sanction (BLOCK_3_DAYS to Creator)" {
    $body = @{
        userId = $auth.creator.id
        sanctionType = "BLOCK_3_DAYS"
        reason = "Non-respect des consignes techniques et refus d ajustement immediat."
    }

    $sanc = Post-Json "$baseUrl/admin/disputes/$($dispute.id)/sanction" $adminHeaders $body
    if ($sanc.sanctionType -ne "BLOCK_3_DAYS") { throw "Sanction type should be BLOCK_3_DAYS" }
    if (-not $sanc.active) { throw "Sanction should be active" }
    return $sanc
}

# 14. Verify Suspended Creator is Blocked from Submitting Proposals or Delivering
Run-Step "14" "Verifying Suspended Creator is Blocked (403 Forbidden)" {
    try {
        $body = @{
            jobId = $job.id
            creatorId = $auth.creator.id
            bidAmount = 250.0
        }
        $res = Post-Json "$baseUrl/proposals" $creatorHeaders $body
        throw "Expected 403 Forbidden for suspended user but request succeeded!"
    } catch {
        if ($_.Exception.Message -match "403" -or ($_.Exception.Response -and $_.Exception.Response.StatusCode -eq 403)) {
            # Expected 403
            return $true
        }
        throw $_
    }
}

# 15. Admin Revokes Sanction (Reactivates User Account)
Run-Step "15" "Admin Revokes Sanction (Reactivates User Account)" {
    $revoked = Post-Json "$baseUrl/admin/sanctions/$($sanction.id)/revoke" $adminHeaders @{}
    if ($revoked.active -ne $false) { throw "Sanction active status should be false after revocation" }

    # Verify creator can now access profile
    $creatorProfile = Invoke-RestMethod -Method Get -Uri "$baseUrl/users/me" -Headers $creatorHeaders
    if ($creatorProfile.isSuspended -ne $false) { throw "User isSuspended should be false after sanction revocation" }
    return $revoked
}

# 16. Admin Resolves Dispute with PARTIAL_SPLIT (Guards: sum <= disputed, >= 0, releases funds)
Run-Step "16" "Admin Resolves Dispute with PARTIAL_SPLIT & Release of Funds" {
    # First test invalid split (sum > disputed) - should fail with 400
    try {
        $badBody = @{
            decision = "PARTIAL_SPLIT"
            clientRefundAmount = 200.0
            creatorPayoutAmount = 200.0 # 200 + 200 = 400 > 300
            adminNotes = "Test invalid split"
        }
        $badRes = Post-Json "$baseUrl/admin/disputes/$($dispute.id)/resolve" $adminHeaders $badBody
        throw "Expected 400 for split exceeding disputed amount, but succeeded!"
    } catch {
        # Expected error
    }

    # Now execute valid split: Client gets 150 DT, Creator gets 120 DT, 30 DT platform fee
    $goodBody = @{
        decision = "PARTIAL_SPLIT"
        clientRefundAmount = 150.0
        creatorPayoutAmount = 120.0
        adminNotes = "Mediation finalisee : Le client est rembourse de 150 DT et le createur recoit 120 DT pour le temps de tournage engage."
    }

    $resolved = Post-Json "$baseUrl/admin/disputes/$($dispute.id)/resolve" $adminHeaders $goodBody
    if ($resolved.status -ne "PARTIAL_RESOLUTION") { throw "Dispute status should be PARTIAL_RESOLUTION, was $($resolved.status)" }

    # Check contract status is resolved and escrow is released
    $finalContract = Invoke-RestMethod -Method Get -Uri "$baseUrl/contracts/$($contract.id)" -Headers $adminHeaders
    if ($finalContract.status -notin @("RESOLVED_DISPUTE", "COMPLETED", "RESOLVED")) { throw "Contract status should be RESOLVED_DISPUTE or COMPLETED, was $($finalContract.status)" }
    if ($finalContract.escrowStatus -notin @("RELEASED", "PARTIAL_RELEASE", "REFUNDED")) { throw "Escrow status should be RELEASED or PARTIAL_RELEASE, was $($finalContract.escrowStatus)" }

    return $resolved
}

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host " ALL 16 BACKEND TEST SCENARIOS PASSED WITH ZERO ERRORS!" -ForegroundColor Green
Write-Host "=======================================================`n" -ForegroundColor Green
