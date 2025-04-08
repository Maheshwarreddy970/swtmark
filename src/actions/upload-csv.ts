'use server';

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Papa from "papaparse";

interface CSVData {
  Name: string;
  Phone: string;
  Email: string;
  Website: string;
  Instagram: string;
  Facebook: string;
  Twitter: string;
  Linkedin: string;
}

interface FirebaseData {
  name: string; // This will be the custom list name
  csvdata: {
    name: string; // Individual contact name
    email: string;
    instagramurl: string;
    currenttask: number;
    starteddate: number;
    instastartingmessage: string;
    emailstartingmessage: string;
    instasecondmessage: string;
    emailsecondmessage: string;
  }[];
}

export async function uploadCSV(formData: FormData) {
  try {
    const file = formData.get('csvFile') as File;
    const listName = formData.get('listName') as string; // Get custom name from form
    
    if (!file) throw new Error("No file uploaded");
    if (!listName) throw new Error("List name is required");

    // Parse CSV
    const csvText = await file.text();
    const parsedData = Papa.parse<CSVData>(csvText, {
      header: true,
      skipEmptyLines: true,
    }).data;

    // Filter and format data
    const validEntries = parsedData.filter(entry => entry.Instagram && entry.Email);
    
    const firebaseData: FirebaseData = {
      name: listName, // Use the custom name provided
      csvdata: validEntries.map(entry => ({
        name: entry.Name, // Individual contact name from CSV
        email: entry.Email,
        instagramurl: entry.Instagram,
        currenttask: 0,
        starteddate: Date.now(),
        instastartingmessage: "",
        emailstartingmessage: "",
        instasecondmessage: "",
        emailsecondmessage: "",
      })),
    };

    // Save to Firestore
    await addDoc(collection(db, "campaigns"), {
      ...firebaseData,
      createdAt: serverTimestamp(),
    });

    return { success: true, count: validEntries.length };
  } catch (error) {
    console.error("Upload failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}