const dateValidation = function(startDate,endDate,todayDate,numberOfMonths) {
       var date1 = new Date(startDate);
       var date2 = new Date(endDate);
       var todayDateObj = new Date(todayDate);
       /*Difference of days Between startDate,endDate */
       var timeDiff=(date2.getTime()- date1.getTime());
       var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
       
       /*Difference of days Between todayDate,startDate */
       var timeTodayStartDateDiff =(todayDateObj.getTime()- date1.getTime());
       var diffTodayStartDateDays = Math.ceil(timeTodayStartDateDiff / (1000 * 3600 * 24));    
       
       var numberOfDays = 0;
       var startmonth = date1.getMonth()+1;
       var endmonth = date2.getMonth()+1;
       if(numberOfMonths==2)
       {
           if(startmonth==7 && endmonth==9 )
           {
               numberOfDays = 62;
           }
           else
           {
               numberOfDays = 61;
           }
       }
       /*Check enddate and todayDate difference should be at most 2 months*/            
       if(diffDays>numberOfDays || diffTodayStartDateDays>numberOfDays)
       {
           return false;
       }
       else
       {
           return true;
       }
};

export { dateValidation };