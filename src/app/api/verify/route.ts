// File: app/api/verify/route.ts

import { NextResponse, type NextRequest } from "next/server";
import {SelfBackendVerifier, AllIds, DefaultConfigStore} from '@selfxyz/core';
import { servicesConfig } from '../../../../env.config';

// Type declaration for global verification results
declare global {
  var verificationResults: Map<string, {
    userId: string;
    nationality: string | null;
    timestamp: string;
    credentialSubject: any;
  }> | undefined;
}

// V2 Configuration: Use AllIds for all document types (recommended for most cases)
const allowedIds = AllIds;

// Option 2: Define specific allowed document types (commented out - not available in current package)
// const allowedIds = new Map();
// allowedIds.set(AttestationId.E_PASSPORT, true);  // Accept passports
// allowedIds.set(AttestationId.EU_ID_CARD, true);  // Accept EU ID cards

// V2 Configuration Store (using V1 package with V2 pattern)
// Note: IConfigStorage not available in current package, using DefaultConfigStore instead
const verification_config = {
  excludedCountries: []
  // minimumAge: 18,     // Not needed for nationality-only verification
  // ofac: true          // Not needed for nationality-only verification
};

const configStore = new DefaultConfigStore(verification_config);

// Initialize V2 verifier (using V1 package with V2 pattern)
const selfBackendVerifier = new SelfBackendVerifier(
  process.env.NEXT_PUBLIC_SELF_SCOPE || "copoazu-prod",
  process.env.NEXT_PUBLIC_SELF_ENDPOINT || "https://copoazushop.vercel.app/api/verify",
  false,                        // mock mode
  allowedIds,                   // NEW: allowed document types
  configStore,                  // NEW: config storage (DefaultConfigStore instead of IConfigStorage)
  "hex"                         // user ID type (hex for wallet addresses, UUID not available in current package)
);

console.log(`🔧 Initializing verifier with SCOPE: ${process.env.NEXT_PUBLIC_SELF_SCOPE}`);
console.log(`🔧 Initializing verifier with ENDPOINT: ${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`);

// 4. CREATE THE API ROUTE HANDLER
export async function POST(req: NextRequest) {
  console.log("✅ Received request at /api/verify endpoint.");

    let requestBody;
  try {
    requestBody = await req.json();
    // DEBUGGING: Log the entire incoming payload to inspect what the frontend is sending
    console.log("📦 Incoming request body:", JSON.stringify(requestBody, null, 2));
  } catch (error) {
    console.error("❌ Failed to parse request body as JSON:", error);
    return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
  }
  // Extract data from the request (V1 format - current package limitation)
  // Support both pubSignals and publicSignals for compatibility
  const { attestationId, proof, publicSignals, pubSignals, userContextData } = requestBody;
  const signals = publicSignals || pubSignals;

  // Verify all required fields are present
  if (!proof || !signals || !attestationId || !userContextData) {
    console.error("❌ Missing required fields in request.");
    return NextResponse.json({
      message: "Proof, publicSignals/pubSignals, attestationId and userContextData are required",
    }, { status: 400 });
  }

  // Verify the proof using V1 method (current package limitation)
  try {
    console.log("⏳ Calling selfBackendVerifier.verify() with V1 format...");
    console.log("📋 AttestationId:", attestationId);
    console.log("📋 UserContextData:", userContextData);
    
    const result = await selfBackendVerifier.verify(
      attestationId,      // Document type (1 for passport, 2 for EU ID)
      proof,
      signals,            // Support both publicSignals and pubSignals
      userContextData     // Hex-encoded context data
    );

    // DEBUGGING: Log the ENTIRE result object from the verifier.
    // This object contains valuable details on why verification might have failed.
    console.log("🔍 Verification result object:", JSON.stringify(result, null, 2));

    // Extract nationality from discloseOutput (as shown in Self docs)
    const nationality = result.discloseOutput?.nationality;

    // Check if verification was successful
    if (result.isValidDetails.isValid) {
      console.log("✅ Verification successful!");
      
      // Log nationality if available
      if (nationality) {
        console.log("🌍 Nationality revealed:", nationality);
        console.log(`🎉 SUCCESS: User verified with nationality: ${nationality}`);
      } else {
        console.log("⚠️ Verification successful but no nationality disclosed");
      }
      
      console.log("📋 Full credential subject data:", result.discloseOutput);
      
      // Store verification result with user context for retrieval
      const verificationResult = {
        userId: userContextData?.userId || 'unknown',
        nationality: nationality || null,
        timestamp: new Date().toISOString(),
        credentialSubject: result.discloseOutput
      };
      
      console.log('💾 Storing verification result:', verificationResult);
      console.log('🌍 Nationality being stored:', verificationResult.nationality);
      
      // In a real implementation, you would store this in a database
      // For now, we'll store it in memory (this will be lost on server restart)
      if (!global.verificationResults) {
        global.verificationResults = new Map();
        console.log('🗄️ Created new verificationResults Map');
      }
      global.verificationResults.set(verificationResult.userId, verificationResult);
      console.log('✅ Stored verification result for userId:', verificationResult.userId);
      
      return NextResponse.json({
        status: "success",
        result: true,
        nationality, // Use the extracted nationality variable
        credentialSubject: result.discloseOutput,
      });
    } else {
      // Verification failed, return the detailed reason
      console.warn("⚠️ Verification failed. Details:", result.isValidDetails);
      return NextResponse.json({
        status: "error",
        result: false,
        message: "Verification failed",
        // Return the specific details about why it failed
        details: result.isValidDetails,
      }, { status: 400 }); // Use 400 for a bad request (invalid proof) instead of 500
    }
 } catch (error: unknown) {
    // DEBUGGING: Log the full error object for a complete stack trace
    console.error('💥 An unexpected error occurred during verification:', error);

    // Handle V2 configuration mismatch errors as per migration guide
    if (error instanceof Error && error.name === 'ConfigMismatchError') {
      console.error('❌ Configuration mismatch error:', error);
      return NextResponse.json({
        status: "error",
        message: "Configuration mismatch",
        issues: (error as any).issues, // V2 provides detailed issues
      }, { status: 400 });
    }

    // Type-safe way to get the error message
    const message = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json({
      status: "error",
      result: false,
      message: "An unexpected error occurred on the server.",
      // In development, you might want to return the error message for easier debugging
      error: process.env.NODE_ENV === 'development' ? message : undefined,
    }, { status: 500 });
  }
}