# Change Log
All notable changes to the "dx-code-companion" extension will be documented in this file.

### 0.2.6

1. Fix issue by changing the folder name of content provider to use Capital letter. Seems very weird that not doing this breaks the plugin for chrome-os. The issue is described here (https://github.com/msrivastav13/DX-Code-Companion/issues/6)

### 0.2.5

1. Adds a new Command Compare With Server to view diff between current local and server file.

2. By default Manage Conflict is switched off .Turn it on via settings 

![Manage conflict](./images/manageConflictSettings.png)

3. Fixed few bugs related to refresh from server on aura components.

### 0.2.4

1. Fixes when .xml files would try to save to server .This is not supported at this point and use native salesforce extension to deploy meta.xml files for version changes .

### 0.2.0

1. Adds ability to manage conflicts with server copy

2. Refresh From Server for LWC, Aura files , triggers , vf pages, vf components and classes

3. Save now compares file with server copy .

4. A new icon on the footer to indicate SalesforceDX Code Companion is active

5. Footer now indicates a rocket symbol if extension is active and you can navigate to org clicking on this .

### 0.1.10

1. Auto populate package list for selection for Retrieve Options

2. Retrieve DX Source and metadata options are only available from Command Palette (CMD+ SHIFT + P on MACOSX or CTRL + SHIFT + P on windows)

3. Previously the Save To Server tried running command on Non Salesforce files .This update fixes this and only saves if the working directory root has sfdx-project.json file.

### 0.1.8

1.Switch between authenticated orgs using new Switch Org Command .This opens up to switch and deploy the code between orgs using SFDX:Deploy To Org Command

![Navigations](./images/switchorg.png)

2.Fix AutoSave to now not run terminal command if file type is not supported

3.Better naming and Grouping .All Commands now CCDX as the prefix .

4.LWC(Lighnting Web Components) support improved

5.Introduces sfdx-core library in the build opening up lot more existing features to come in next release.

### 0.1.4

1.Auto Save enabled .You can disable using the autosave property

![Auto Save Feature](./images/autosavefeature.png)

Use the settings (Select Code > Preferences > Settings) from the gear icon and modify the usersettings to disable the autosave feature as shown below by setting dx-code-companion.autosave.enabled as false .

![Auto Save Feature](./images/autosavedisable.png)

2.Save LWC Components(Under preview).Upgrade the mo-dx-plugin using sfdx:plugins:update mo-dx-plugin

### 0.1.3

1.Add support to retrieve metadata using package name in regular metadata format

2.Add some useful link in editor title for vf preview , app builder page ,metadata coverage report and component Library.

### 0.0.5

1. Fixes issues for keyboard shortcut

### 0.0.2

1. Provides quick save apex,vf,aura bundles to salesforce server
2. Retrieve Source from Salesforce using DX Source format.
3. 3X performant than salesforce deploy command for apex,aura and vf files.