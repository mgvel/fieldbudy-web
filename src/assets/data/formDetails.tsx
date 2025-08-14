const formDetails = [
  {
    id: "page-1",
    parent: "Scope of Work",
    title: [
      {
        id: "assignment-scope",
        name: "Assignment Sheet Scope",
      },
      {
        id: "received-scope",
        name: "Scope from Received Documents",
      },
      {
        id: "interview-scope",
        name: "Scope from Interview",
      },
      {
        id: "select-standard",
        name: "Select Standard Scope",
      },
      {
        id: "standard-scope",
        name: "Standard Scope",
      },
    ],
  },
  {
    id: "page-2",
    parent: "Property Background",
    title: [
      {
        id: "select-building",
        name: "Select Building Type",
      },
      {
        id: "story-number",
        name: "Enter Number of Stories",
      },
      {
        id: "active-story",
        name: "Enter Story",
      },
      {
        id: "select-construction",
        name: "Select Structure Construction Type",
      },
      {
        id: "select-foundation",
        name: "Select Foundation Type",
      },

      {
        id: "property-file",
        name: "Property File",
      },
      {
        id: "property-note",
        name: "Notes for Property Appraiser's Record",
      },
      {
        id: "topography-file",
        name: "Attach File",
      },
      {
        id: "note-file",
        name: "Notes for Topographic Map",
      },
    ],
  },
  {
    id: "page-3",
    parent: "Interviewee(s)",
    title: [
      {
        id: "interviewee-contact",
        name: "Contact Method",
      },
      {
        id: "interviewee-salutation",
        name: "Select Mr./Mrs.",
      },
      {
        id: "interviewee-firstname",
        name: "First Name",
      },
      {
        id: "interviewee-lastname",
        name: "Last Name",
      },
      {
        id: "interviewee-title",
        name: "Select Title",
      },
      {
        id: "interviewee-company",
        name: "Company Name",
      },
      {
        id: "interviewee-significance",
        name: "Interviewee Significance",
      },
      {
        id: "interviewee-business-front",
        name: "Business Card Front",
      },
      {
        id: "interviewee-business-back",
        name: "Business Card Back",
      },
      {
        id: "interviewee-docs",
        name: "Upload Documents",
      },
    ],
  },
  {
    id: "page-4",
    parent: "Interview QnA",
    title: [
      {
        id: "property-purchase",
        name: "When was the property purchased?",
      },
      {
        id: "dol",
        name: "DOL per the interviewee",
      },
      {
        id: "record-interview",
        name: "Interview Recording",
      },
      {
        id: "interview-structure-built",
        name: "When was the structure built?",
      },
      {
        id: "interview-roof-replaced",
        name: "When was the roof last replaced?",
      },
      {
        id: "interview-interior-damage",
        name: "Interior damage general information",
      },
      {
        id: "exterior-notes",
        name: "Exterior damage general information",
      },
      {
        id: "interview-room",
        name: "Select Room/Area 1",
      },
    ],
  },
  {
    id: "page-5",
    parent: "Field Sketches",
    title: [
      {
        id: "interior-sketch-images",
        name: "Upload Images",
      },
      {
        id: "interior-sketch-notes",
        name: "Add Notes",
      },
      {
        id: "roof-sketch-images",
        name: "Upload Images",
      },
      {
        id: "roof-sketch-notes",
        name: "Add Notes",
      },
    ],
  },
  {
    id: "page-6",
    parent: "Document Reviews",
    title: [
      {
        id: "document-images",
        name: "Upload Data File",
      },
      {
        id: "document-desc",
        name: "",
      },
      {
        id: "document-notes",
        name: "The following items in this image were particularly noteworthy:",
      },
    ],
  },
  {
    id: "page-7",
    parent: "WRHT Data",
    title: [
      {
        id: "wind-images",
        name: "Upload Data File",
      },
      {
        id: "wind-notes",
        name: "",
      },
      {
        id: "hail-images",
        name: "Upload Data File",
      },
      {
        id: "hail-notes",
        name: "",
      },
      {
        id: "tornado-images",
        name: "Upload Data File",
      },
      {
        id: "tornado-notes",
        name: "",
      },
    ],
  },
  {
    id: "page-8",
    parent: "Lightning Strike",
    title: [
      {
        id: "lightning-images",
        name: "Upload Data File",
      },
      {
        id: "lightning-notes",
        name: "",
      },
    ],
  },
  {
    id: "page-9",
    parent: "Flood Data",
    title: [
      {
        id: "river-images",
        name: "Upload Data File",
      },
      {
        id: "river-notes",
        name: "",
      },
      {
        id: "water-images",
        name: "Upload Data File",
      },
      {
        id: "water-notes",
        name: "",
      },
      {
        id: "buoy-images",
        name: "Upload Data File",
      },
      {
        id: "buoy-notes",
        name: "",
      },
      {
        id: "distance-images",
        name: "Upload Data File",
      },
      {
        id: "distance-notes",
        name: "",
      },
    ],
  },
  {
    id: "page-10",
    parent: "Historical Image Review",
    title: [
      {
        id: "aerial-images",
        name: "Upload Data File",
      },
      {
        id: "aerial-notes",
        name: "The following items in this image were particularly noteworthy:",
      },
      {
        id: "realtor-images",
        name: "Upload Data File",
      },
      {
        id: "realtor-notes",
        name: "The following items in this image were particularly noteworthy:",
      },
      {
        id: "google-images",
        name: "Upload Data File",
      },
      {
        id: "google-notes",
        name: "The following items in this image were particularly noteworthy:",
      },
      {
        id: "zillow-images",
        name: "Upload Data File",
      },
      {
        id: "zillow-notes",
        name: "The following items in this image were particularly noteworthy:",
      },
      {
        id: "redfin-images",
        name: "Upload Data File",
      },
      {
        id: "redfin-notes",
        name: "The following items in this image were particularly noteworthy:",
      },
    ],
  },
  {
    id: "page-11",
    parent: "Soil Data",
    title: [
      {
        id: "soil-images",
        name: "Upload Data File",
      },
      {
        id: "soil-notes",
        name: "The following items in this image were particularly noteworthy:",
      },
    ],
  },
];

export default formDetails;
