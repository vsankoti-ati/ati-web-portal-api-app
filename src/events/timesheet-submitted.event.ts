export class TimesheetSubmittedEvent {
    constructor(
        public readonly timesheetId: string,
        public readonly submitterId: string,
        public readonly submitterEmail: string,
        public readonly submitterName: string,
        public readonly weekStartDate: Date,
        public readonly weekEndDate: Date,
        public readonly submitterGeoLocation: string,
    ) {}
}
