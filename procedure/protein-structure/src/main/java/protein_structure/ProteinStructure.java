package protein_structure;

import org.python.core.PyObject;
import org.python.core.PyString;
import org.python.util.PythonInterpreter;

/**
 * Wrapper for protein structure functions
 * @author Ana Peraita
 *
 */
public class ProteinStructure 
{

    public static String pred(String rlist){
    	try {
    	PythonInterpreter interpreter = new PythonInterpreter();
    	interpreter.exec("import sys\nsys.path.append('../external/python/code')\nfrom sec import pred");
    	interpreter.exec("print(sys.path)");
    	
    	// execute a function that takes a string and returns a string
    	PyObject predFunc = interpreter.get("pred");
    	
    	PyObject result = predFunc.__call__(new PyString(rlist));
    	String realResult = (String) result.__tojava__(String.class);
    	interpreter.close();
		return realResult;
    	}catch(Exception e){
    		
    	}
    	return "";
    }
    
    
}
