const en = {
    translation:{
        home:{
            appName: "Insurance Reporter App",
            login: "Login",
            register: "Sign In",
            about: "About",
            contact: "Contact Us",
        },
        login:{
            email: "Email",
            password: "Password",
            login: "LogIn",
            loginText: "Login to your account",
            register: "Sign In",
            emailEmpty:"Email cannot be empty",
            passwordEmpty:"Password cannot be empty",
        },
        register:{
            name:"Name",
            email: "Email",
            password: "Password",
            confirmPassword: "Confirm Password",
            register: "Sign In",
            registerText: "Create an account",
            login: "Login",
            nameEmpty:"Name cannot be empty",
            emailEmpty:"Email cannot be empty",
            passwordEmpty:"Password cannot be empty",
            passwordDontMatch:"Passwords do not match"
        },
        dashboard:{
            occurrence:"Occurrence",
            profile:"Profile",
            intervenor:"Intervenor"
        },
        profile:{
            profile:"Profile",
            name:"Name",
            email:"Email",
            logout:"Logout"
        },
        intervenor:{
            intervenors:"Intervenors",
            searchIntervenor:"Search Intervenor",
            searchBy:"Search by",
            phoneNumber:"Phone Number",
            intervenorId:"Intervenor Identifier",
            enterPhoneNumber:"Enter phone number",
            enterIntervenorId:"Enter ID Number",
            search:"Search",
            createIntervenor:"Create Intervenor",
            name:"Name",
            contact:"Contact",
            address:"Address",
            idType: "ID Type",
            idNumber:"ID Number",
            updateInformation:"Update Intervenor Information",
            add:"Add",
            intervenorNotFound:"Intervenor not found.",
        },
        intervenorCreate:{
            idNumberEmpty:"ID Number cannot be empty",
            idTypeEmpty:"ID Type cannot be empty",
            nameEmpty:"Name cannot be empty",
            phoneNumberEmpty:"Phone number cannot be empty",
            addressEmpty:"Address cannot be empty",
            intervenorMessage:"Crate a new Intervenor",
            intervenorId:"Intervenor Identifier",
            intervenorIdType:"Intervenor Identifier Type",
            intervenorPhoneNumber:"Intervenor Phone Number",
            intervenorName:"Intervenor Name",
            intervenorAddress:"Intervenor Address",
            createIntervenor:"Create Intervenor",
            cancel:"Cancel"
        },
        occurrence:{
            occurrenceList:"Occurrence List",
            initDate: "Initial Date",
            endDate: "End Date",
            importance: "Importance",
        },
        occurrenceDetails:{
            occurrenceDetails: "Occurrence Details",
            initDate: "Initial Date",
            endDate: "End Date",
            importance: "Importance",
            occurrenceType:"Occurrence Type",
            occurrenceInfo:"Occurrence Information",
            goEvidences: "Go to Evidences",
            seeIntervenors:"See Intervenors"
        },
        occurrenceIntervenors:{
            occurrenceIntervenors: "Intervenors in Occurrence",
            intervenorId:"Intervenor Identifier",
            intervenorIdType:"Intervenor Identifier Type",
            intervenorPhoneNumber:"Intervenor Phone Number",
            intervenorName:"Intervenor Name",
            intervenorAddress:"Intervenor Address",
            remove:"remove",
            addIntervenors:"Add Intervenors",
        }
    }
}

export default en
export type Translations = typeof en