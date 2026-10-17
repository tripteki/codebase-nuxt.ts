import { downloadCsvFile, } from "@/lib/sample";

export function downloadPermissionImportSample (): void {
    downloadCsvFile ("permissions_import_sample.csv", [
        [ "name", "guard_name", ],
        [ "report.view", "web", ],
    ]);
}
