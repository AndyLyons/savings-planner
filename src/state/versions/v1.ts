type AccountId = string & { __accountId__: never }
type DepositId = string & { depositId__: never }
type PersonId = string & { __personId__: never }
type StrategyId = string & { __strategyId__: never }
type WithdrawalId = string & { __withdrawalId__: never }

type YYYY = number & { __yyyy__: never }
type YYYYMM = number & { __yyyymm__: never }

enum Period {
    MONTH = 'month',
    YEAR ='year'
}

enum WithdrawalType {
    FIXED_PER_YEAR = 'FIXED_PER_YEAR',
    FIXED_PER_MONTH = 'FIXED_PER_MONTH',
    PERCENTAGE = 'PERCENTAGE',
    STATIC_PERCENTAGE = 'STATIC_PERCENTAGE'
}

export type V1 = {
    globalGrowth: number
    showIncomes: boolean
    showAges: boolean
    strategy: StrategyId | null
    people: Array<{
        id: PersonId
        name: string
        dob: YYYY
    }>
    accounts: Array<{
        id: AccountId
        name: string
        growth: number | null
        compoundPeriod: number
        owner: PersonId
        balances: Array<{
            year: YYYY
            value: number
        }>
    }>
    strategies: Array<{
        id: StrategyId
        name: string
        deposits: Array<{
            id: DepositId
            amount: number
            startYear: YYYY | '__START__'
            repeating: boolean
            endYear: YYYY | '__RETIREMENT__' | null
            period: Period
            account: AccountId
        }>
        withdrawals: Array<{
            id: WithdrawalId
            amount: number | null
            type: WithdrawalType
            startDate: YYYYMM | '__RETIREMENT__'
            repeating: boolean
            endDate: YYYYMM | null
            taxRate: number
            account: AccountId
        }>
    }>
}

export const isV1 = (json: any): json is V1 => !('version' in json)