export class WfhRejectedEvent {
    constructor(
        public readonly wfhRequestId: string,
        public readonly userId: string,
        public readonly userEmail: string,
        public readonly userName: string,
        public readonly startDate: Date,
        public readonly endDate: Date,
        public readonly reason: string,
        public readonly approverName: string,
        public readonly approverComments: string,
    ) {}
}
