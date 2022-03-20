        function dectobin(x){
            let i = 0;
            let f =x;
    
            while(f/2>0){
            i++;
            f/=2;
            }
            
            let j = [];
    
            for(i; i>-1;i--){
            if(x%2==0){
            j = pushfront(j, 0);}
            else{
            j = pushfront(j, 1);}
            roundDownDiv(x,2);
            }
            return j;
            }
        
    
            function isDiv(x){
            if (x/2>0){ 
                return true;
            }
            else {return false}
            }
    
            function isEv(x){
    
            if (x%2==0){
                 return true;
            }else{
             return false;}
            }
    
            function pushfront( x,  j){
            let f = [];
            f.push(j);
            for(let i=0; i<x.length; i++){
            f.push(x);
            }
            x = f;
            return x;
    
            }
    
            function roundDownDiv( x, y){
            x=(x/y)-((x/y)-((x%y)*x));
            }