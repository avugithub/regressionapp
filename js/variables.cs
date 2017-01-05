        public double[] Intr { get; set; } //interest rate
        public double[] IntrNet { get; set; } //interest rate
        public double[][] AltIntr { get; set; }
        public double[] AltIntrSG { get; set; }
        public double[][] IntrSummary { get; set; }
        public double[][][] AltIntrSummary { get; set; }

        public double[][] AnnPay { get; set; }
        public double[][] AltAnnPay { get; set; }
        public double[][] annTotDeduction { get; set; }

        public double[][] annnarreport { get; set; }

        public double[][] loanRepay { get; set; }
        public double[][] altloanRepay { get; set; }

        public double[][] loanintcharged { get; set; }
        public double[][] altloanintcharged { get; set; }


        public double[][] PolicyValueNetOfSurrenderCharge { get; set; }
        public double[][] altPolicyValueNetOfSurrenderCharge { get; set; }

        

        public double[][] altannnarreport { get; set; }
        public int overloanYear { get; set; }
        public double[] orgPremPct { get; set; }
        


        public double[][] alt_annTotDeduction { get; set; }

        public double[][] annTotLoad { get; set; }
        public double[][] altannTotLoad { get; set; }

        public double[] AltAnnPaySG { get; set; }
        public double[][] AnnGPay { get; set; }
        public double[][] AltAnnGPay { get; set; }
        public double[] AltAnnGPaySG { get; set; }
        public double[] Surrender { get; set; }
        public double[][] AltSurrender { get; set; }
        public double[][] SurrenderReports { get; set; }
        public double[] AltSurrenderSG { get; set; }
        public double[][] Loan { get; set; }
        public double[][] alttotloan { get; set; }
        public double[][] totLoan { get; set; }

        public double[][][] cumguarav { get; set; }
        public double[][][] cumguarcv { get; set; }
        


        public double[][] loantaken { get; set; }
        public double[][] altloantaken { get; set; }


        public double[][] AltLoan { get; set; }
        public double[][] AltLoanSG { get; set; }
        public double[][] LoanInt { get; set; }
        public double[][] LoanIntCred { get; set; }
        public double[][] altLoanIntCred { get; set; }

        

        public double[][] AnnIntr { get; set; }

        public double[][] npcost { get; set; }
        public double[][] scost { get; set; }
        public double[][] altnpcost { get; set; }
        public double[][] altscost { get; set; }


        public double[][] AltAnnIntr { get; set; }
        public double[][] AltAnnIntrSG { get; set; }
        public double[][] GrossCv { get; set; }
        public double[][] AltCV { get; set; }
        public double[][] AltCVSG { get; set; }
        public double[][] NetCv { get; set; }
        public double[][] AltNet { get; set; }
        public double[][] AltNetSG { get; set; }
        public double[][] HoneyMoonCV { get; set; }
        public double[][] AltHoney { get; set; }
        public double[][] AltHoneySG { get; set; }
        public double[][] DeathBen { get; set; }
        public double[][] AltDeathBen { get; set; }
        public int[][][] FaceAmount { get; set; }
        public int[][] faceamtAVU { get; set; }
        public int[][] altfaceamtAVU { get; set; }

        public double[][] AltDben { get; set; }
        public int[][] altface { get; set; }

        public double[][] anncumprem { get; set; }
        public double[][] altanncumprem { get; set; }
        public double[][] deemedcv { get; set; }



        public double[][] AltDbenSG { get; set; }
        public int[] LapsedYr { get; set; }
        public int[] AltLapsedYr { get; set; }
        public int[] AltLapsedYrSG { get; set; }
        public int[] Footnote { get; set; }
        public int[][] AltFootnote { get; set; }

        public bool[] footnoteGL { get; set; }
        public bool[][] AltfootnoteGL { get; set; }

        public bool[] footnoteNLPONC { get; set; }
        public bool[][] AltfootnoteNLPONC { get; set; }

        public bool[] footnoteNLPONG { get; set; }
        public bool[][] AltfootnoteNLPONG { get; set; }

        public bool[] footnoteCURPLUSMASK { get; set; }
        public bool[][] AltfootnoteGURPLUSMASK { get; set; }

        public bool[] footnoteCAPMASK { get; set; }
        public bool[][] AltfootnoteCAPMASK { get; set; }
        public bool[] footnoteUP { get; set; }
        public bool[][] AltfootnoteUP { get; set; }

        public bool[] footnoteMEC { get; set; }
        public bool[][] AltfootnoteMEC { get; set; }



        public int[] AltFootnoteSG { get; set; }

        public double[] Premium { get; set; }
        public double[] TotDistCost { get; set; }
        public double[][] ValueofPremSG { get; set; }
        public double[][] Rate { get; set; }
        public double[][] SubstdRate { get; set; }
        public double[][] MCharge { get; set; }
        public int[][] PolFee { get; set; }
        public double Periodic { get; set; }
        public int[][][] RapAmt { get; set; }
        public int Target { get; set; }
        public int[][] TargetYr { get; set; }
        public int[][] AltTargetYr { get; set; }
        public int LoanOn { get; set; }
        public int EndPay { get; set; }
        public int wdexceedbasis { get; set; }
        public double[] FDCV { get; set; }
        public double[] NetAnnPay { get; set; }

        public double[][] NetAnnualPay { get; set; }
        public double[][] AltNetAnnualPay { get; set; }
        public int[][] policyChangeYear { get; set; }
        

        public double[][] IrrCv { get; set; }
        public double[][] IrrDb { get; set; }
        public double[][] AltIrrCv { get; set; }
        public double[][] AltIrrDb { get; set; }
        public double[][] TDR { get; set; }
        public double[][] PER_DETAIL { get; set; }
        public double[][] PER { get; set; }
        public double[][] surrEndrsCv { get; set; }
        public double[][] surrCharge { get; set; }

        public double[][] baseMDRateReport { get; set; }
        public double[][] basePerkReport { get; set; }
        
        public bool PlusFlag { get; set; }
        public int SurrFlag { get; set; }
        public int[] histearliestyear { get; set; }

        public bool CapFlag { get; set; }

        public int NarDeathBen { get; set; }

        public bool AceOn { get; set; }
        public double SinglePrem { get; set; }
        public bool HoneyMoon { get; set; }
        public double MnlpPrem { get; set; }
        public double MnlpPremFE { get; set; }
        public double[] NlpRate { get; set; }
        public double[] NlpSubstd { get; set; }
        public double[] NlpFund { get; set; }
        public double[] OverFund { get; set; }
        public int BackDateMonths { get; set; }

        public double[][] gsp { get; set; }
        public double[][] glp { get; set; }
        public double[][] tamra { get; set; }
        public double[][] nlpAmount { get; set; }
        public double[][] altnlpAmount { get; set; }
        public double[][] nlppremmonthlyreport { get; set; }
        
        public double[][] gspReports { get; set; }
        public double[][] altgspReports { get; set; }

        public double[][] rideramtAI { get; set; }
        public double[][] rideramtCIR { get; set; }
        public double[][] rideramtGIR { get; set; }

        public double[][] nlpAmountReports { get; set; }
        public double[][] altnlpAmountReports { get; set; }

        public double[][] glpReports { get; set; }
        public double[][] altglpReports { get; set; }
        public double[][] tamraReports { get; set; }
        public double[][] alttamraReports { get; set; }

        public double[] underWritingAmount { get; set; }
        public double[][] nspReport { get; set; }
        public double[][] altnspReport { get; set; }
        public double[][] nspBaseReport { get; set; }
        public double[][] altnspBaseReport { get; set; }

        public double[][] ridernspReport { get; set; }
        public double[][] altridernspReport { get; set; }
        public double[][] merate { get; set; }
        public double mregprem { get; set; }

        public double initLTCMNLP { get; set; }
        public double initADBCost { get; set; }
        public double initADBMNLP { get; set; }
        public double initBIRMNLP { get; set; }
        public double initCIRCost { get; set; }
        public double initCIRMNLP { get; set; }
        public double initDWPBenefit { get; set; }
        public double initDWPCost { get; set; }
        public double initDWPMNLP { get; set; }
        public double initWMDCost { get; set; }
        public double initWMDMNLP { get; set; }
        public double initGIRCost { get; set; }
        public double initGIRMNLP { get; set; }
        public double orgLoadThresholdPrem { get; set; }

        

        public double[] initLTCCharge { get; set; }
        public double[] initAIRMNLP { get; set; }
        public double[] initAIRCharge { get; set; }
        public double[] initBIRCharge { get; set; }
        public double[][] initRiderMNLP { get; set; }
        public double[][] altinitRiderMNLP { get; set; }

        public double[] prefLoanCharge { get; set; }
        public double[] regLoanCharge { get; set; }
        public double[] prefLoanCredit { get; set; }
        public double[] regLoanCredit { get; set; }





        //Output for AVU
        public double[, , ,] coiReportMonthly { get; set; }
        public double[, , ,] premReportMonthly { get; set; }
        public double[, , ,] depositReportMonthly { get; set; }
        public double[, , ,] rideramtWP { get; set; }
        public double[, , ,] rideramtDWP { get; set; }
        public double[, , ,] ltcReportMonthly { get; set; }
        public double[, , ,] narReportMonthly { get; set; }
        public double[, , ,] perKReportMonthly { get; set; }
        public double[, , ,] polFeeReportMonthly { get; set; }
        public double[, , ,] riderReportMonthly { get; set; }
        public double[, , ,] principalCVReportMonthly { get; set; }
        public double[, , ,] interestReportMonthly { get; set; }
        public double[, , ,] persistencyReportMonthly { get; set; }
        public double[, , ,] MEchargeReport { get; set; }
        public double[, , ,] totalDeductionReportMonthly { get; set; }
        public double[, , ,] loanAMonthlyReport { get; set; }
        public double[, , ,] loanBMonthlyReport { get; set; }
        public double[, , ,] withdrawalmonthly { get; set; }
        public double[,,,] withdrawalfee { get; set; }
        
        public double[, , ,] cumpremReport { get; set; }

        public double[, , ,] deemednar { get; set; }
        public double[, , ,] deemedcvmnth { get; set; }
        public double[, , ,] deemedint { get; set; }
        public double[, , ,] deemedmd { get; set; }
        public double[, , ,] deemedprem { get; set; }
        public double[, , ,] deemedrider { get; set; }


        public double[, , ,,] IndexAccountAV { get; set; }
        public double[, , ,,] IndexMDAmount { get; set; }
        public double[, , ,] gainForLoan { get; set; }
        public double[, , ,] IndexspPlusIAMC { get; set; }
        public double[, , ,] IndexglobalPlusIAMC { get; set; }
        public double[, , ,] IndexEligibleAmount { get; set; }
        public double[, , ,] IndexExcessInt { get; set; }

        public double[, , ,] cumGuarEOM { get; set; }
        public double[, , ,] cumGuarInt { get; set; }
        public double[, , ,] cumGuarNetPrem { get; set; }
        public double[, , ,] cumGuarWD { get; set; }
        public double[, , ,] cumGuarMD { get; set; }
        public double[, , ,] cumGuarNAR { get; set; }
        public double[, , ,] cumGuarDB { get; set; }

        public double portExp { get; set; }

        public int exp1035mnth { get; set; }
        public double internal1035 { get; set; }
        public double external1035 { get; set; }
        public int costbasis1035 { get; set; }
        public int mecFlag { get; set; }

        public int mec1035 { get; set; }
        public int cpcap { get; set; }
        public int costbasis1035ext { get; set; }
        public int costbasis1035int { get; set; }

        public bool unnecflag { get; set; }
        public bool nlpflag { get; set; }
        public bool capflag { get; set; }
        public bool overloanflag { get; set; }
        public double lumpsum { get; set; }

        public double reports1035;

        //public double[][][][] coiReportMonthly { get; set; }
        //public double[][][][] premReportMonthly { get; set;}
        //public double[][][][] depositReportMonthly { get; set;}
        //public double[][][][] ltcReportMonthly { get; set;}
        //public double[][][][] narReportMonthly { get; set;}
        //public double[][][][] perKReportMonthly { get; set;}
        //public double[][][][] polFeeReportMonthly { get; set;}
        //public double[][][][] riderReportMonthly { get; set;}
        //public double[][][][] principalCVReportMonthly { get; set; }
        //public double[][][][] interestReportMonthly { get; set; }
        //public double[][][][] persistencyReportMonthly { get; set; }
        //public double[][][][] MEchargeReport { get; set; }
        //public double[][][][] totalDeductionReportMonthly { get; set; }
        //public double[][][][] loanAMonthlyReport { get; set; }
        //public double[][][][] loanBMonthlyReport { get; set; }
        //public double[][][][] withdrawalmonthly { get; set; }
        //public double[][][][] cumpremReport { get; set; }


        public double[] dbftr { get; set; }
        public double[][] birnlp { get; set; }
        public double[][] altbirnlp { get; set; }
        public double[][] dwmnlp { get; set; }
        public double[][] altdwmnlp { get; set; }
        public double[][] ltcnlp { get; set; }
        public double[][] altltcnlp { get; set; }
        public double[][] ltcbenefit { get; set; }
        public double[][] nlpbase { get; set; }
        public double[][] altnlpbase { get; set; }
        public double[][] ainlp { get; set; }
        public double[][] altainlp { get; set; }
        public double[][] cirnlp { get; set; }
        public double[][] altcirnlp { get; set; }
        public double[][] cirwpnlp { get; set; }
        public double[][] altcirwpnlp { get; set; }
        public double[][][] airnlp { get; set; }
        public double[][] DeathBenNetOfLoan { get; set; }
        public double[][] GrossCvGrossOfLoan { get; set; }
        public double[][] AltGrossCvGrossOfLoan { get; set; }
        public double[][] premiumOutlay { get; set; }
        public double[][] altpremiumOutlay { get; set; }
        public double[][] altloanintrreport { get; set; }
        public double[][] loanintrreport { get; set; }

        public double[][] policyValNetofSC { get; set; }

        
        public int mnlpper { get; set; }
        
        [ScriptIgnore]
        public Dictionary<string, string> QuoteValuePairs { get; set; }

        [ScriptIgnore]
        public QuickView QuickView { get; set; }
        
        [ScriptIgnore]
        public Dictionary<string, object> ReportData { get; set; }
        [ScriptIgnore]
        public List<Message> Messages { get; set; }
