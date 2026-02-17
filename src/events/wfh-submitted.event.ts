export class WfhSubmittedEvent {
    constructor(
        public readonly wfhRequestId: string,
        public readonly submitterId: string,
        public readonly submitterEmail: string,
        public readonly submitterName: string,
        public readonly startDate: Date,
        public readonly endDate: Date,
        public readonly reason: string,
        public readonly submitterGeoLocation: string,
    ) {}
}
